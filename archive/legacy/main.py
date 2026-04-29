'''
main.py — ToonBot Telegram bot entry point (Pure Chat Interface).
'''
import hashlib
import hmac
import json
import logging
import os
import time
import urllib.parse
import asyncio
from typing import Any

import telebot
from telebot import types
from dotenv import load_dotenv

from contracts import (
    CONTRACT_ADDRS, 
    get_claimable, 
    get_oracle_price,
    get_wallet_address,
    get_jetton_balance,
    get_governance_count,
    get_proposal,
    get_drop_stats,
    get_registry_total,
    get_amm_reserves
)
from storage import (
    get_tracks_by_artist, 
    get_all_tracks, 
    get_track_by_id,
    get_session, 
    init_db, 
    upsert_session,
    add_track
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("toonbot")

BOT_TOKEN  = os.environ["BOT_TOKEN"]
CHANNEL_ID = int(os.environ["CHANNEL_ID"])

# Initialize telebot
bot = telebot.TeleBot(BOT_TOKEN, parse_mode="HTML")

# ─────────────────────────────────────────────────────────────────────────────
# Menus & UI Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_persistent_menu():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.row("🎵 Browse", "👤 Profile")
    markup.row("🎨 Artist Studio", "📈 Stats")
    markup.row("💰 Claim", "🗳️ Governance")
    return markup

def get_main_menu(tg_id: int):
    session = get_session(tg_id)
    wallet_status = "✅ Connected" if session else "❌ Not Connected"
    
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("🎵 Browse Tracks", callback_data="browse"),
        types.InlineKeyboardButton("🎸 My Tracks", callback_data="my_tracks"),
        types.InlineKeyboardButton("📈 Price", callback_data="price"),
        types.InlineKeyboardButton("💰 Claimable", callback_data="claimable"),
        types.InlineKeyboardButton("💎 Balance", callback_data="balance"),
    )
    if not session:
        markup.add(types.InlineKeyboardButton("🔗 Connect Wallet", callback_data="connect"))
    else:
        markup.add(
            types.InlineKeyboardButton("👤 Profile", callback_data="profile"),
            types.InlineKeyboardButton("🎨 Artist Studio", callback_data="artist_studio")
        )
        
    text = (
        "🎵 <b>Welcome to ToonPlayerBot!</b>\n\n"
        "Discover and trade music NFTs directly in Telegram.\n\n"
        f"<b>Wallet:</b> {wallet_status}"
    )
    return text, markup

# ... (show_browse and other helpers remain similar)

def show_browse(chat_id: int, message_id: int = None):
    tracks = get_all_tracks()
    if not tracks:
        text = "No tracks available yet."
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
    else:
        text = "<b>🎵 Available Tracks</b>\nSelect a track to view details or buy:"
        markup = types.InlineKeyboardMarkup(row_width=1)
        for track in tracks:
            title = track["title"] or "Untitled"
            price = track["price"] / 1e9 if track["price"] else 0
            markup.add(types.InlineKeyboardButton(
                f"{title} — {price:.2f} TON",
                callback_data=f"view_track:{track['track_id']}"
            ))
        markup.add(types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu"))
    
    if message_id:
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)
    else:
        bot.send_message(chat_id, text, reply_markup=markup)

# ─────────────────────────────────────────────────────────────────────────────
# Command Handlers
# ─────────────────────────────────────────────────────────────────────────────

@bot.message_handler(commands=["start", "menu"])
def cmd_start(message: types.Message) -> None:
    text, inline_markup = get_main_menu(message.from_user.id)
    bot.send_message(
        message.chat.id, 
        text, 
        reply_markup=get_persistent_menu()
    )
    bot.send_message(
        message.chat.id, 
        "Quick actions:", 
        reply_markup=inline_markup
    )

# ─────────────────────────────────────────────────────────────────────────────
# Persistent Menu Button Handlers
# ─────────────────────────────────────────────────────────────────────────────

@bot.message_handler(func=lambda m: m.text == "🎵 Browse")
def btn_browse(message: types.Message):
    show_browse(message.chat.id)

@bot.message_handler(func=lambda m: m.text == "👤 Profile")
def btn_profile(message: types.Message):
    tg_id = message.from_user.id
    session = get_session(tg_id)
    if not session:
        bot.send_message(message.chat.id, "❌ Wallet not connected. Use /connect or the 'Connect' button in the menu.")
        return
    
    # Check balance
    master_addr = CONTRACT_ADDRS.get("jetton_master")
    balance_text = "Checking balance..."
    if master_addr:
        async def check():
            wallet_addr = await get_wallet_address(master_addr, session["ton_address"])
            if not wallet_addr: return 0
            return await get_jetton_balance(wallet_addr)
        try:
            balance_nano = asyncio.run(check())
            balance_text = f"💎 <b>{balance_nano / 1e9:,.2f} TOON</b>"
        except:
            balance_text = "⚠️ Error fetching balance"

    text = (
        f"👤 <b>Your Profile</b>\n\n"
        f"<b>TG ID:</b> <code>{tg_id}</code>\n"
        f"<b>Wallet:</b> <code>{session['ton_address']}</code>\n"
        f"<b>Balance:</b> {balance_text}"
    )
    bot.send_message(message.chat.id, text)

@bot.message_handler(func=lambda m: m.text == "🎨 Artist Studio")
def btn_artist_studio(message: types.Message):
    text = (
        "🎨 <b>Artist Studio</b>\n\n"
        "Manage your tracks and releases.\n\n"
        "To register as an artist, use the button below.\n"
        "To add a track locally: <code>/register track_id \"Title\" price_ton</code>"
    )
    markup = types.InlineKeyboardMarkup(row_width=1)
    
    reg_addr = CONTRACT_ADDRS.get("registry", "")
    if reg_addr:
        # Register: meta (string)
        # Using a default meta for now, ideally would ask user for it
        reg_url = f"ton://transfer/{reg_addr}?amount=100000000&text=register:Artist"
        markup.add(types.InlineKeyboardButton("✨ Become an Artist", url=reg_url))
        
    markup.add(
        types.InlineKeyboardButton("🎸 My Tracks", callback_data="my_tracks"),
    )
    bot.send_message(message.chat.id, text, reply_markup=markup)

@bot.message_handler(func=lambda m: m.text == "📈 Stats")
def btn_stats(message: types.Message):
    price = asyncio.run(get_oracle_price())
    drop_stats = asyncio.run(get_drop_stats())
    reg_total = asyncio.run(get_registry_total())
    amm_res = asyncio.run(get_amm_reserves())
    
    price_text = f"<b>{price/1e9:.6f} TON</b>" if price else "N/A"
    rev_ton = drop_stats["revenue"] / 1e9
    
    res0 = amm_res["reserve0"] / 1e9
    res1 = amm_res["reserve1"] / 1e9
    
    text = (
        "📈 <b>Protocol Stats</b>\n\n"
        f"💰 <b>TOON Price:</b> {price_text}\n"
        f"🎸 <b>Total Revenue:</b> {rev_ton:.2f} TON\n"
        f"🎨 <b>Total Artists:</b> {reg_total}\n\n"
        "<b>🌊 AMM Liquidity:</b>\n"
        f"• Reserve 0: {res0:,.2f} TOON\n"
        f"• Reserve 1: {res1:,.2f} TON"
    )
    bot.send_message(message.chat.id, text)

@bot.message_handler(func=lambda m: m.text == "💰 Claim")
def btn_claim(message: types.Message):
    tg_id = message.from_user.id
    session = get_session(tg_id)
    if not session:
        bot.send_message(message.chat.id, "Please connect your wallet first.")
        return

    drop_addr = CONTRACT_ADDRS.get("drop", "")
    if not drop_addr:
        bot.send_message(message.chat.id, "Drop contract not configured.")
        return

    try:
        amount_nano = asyncio.run(get_claimable(drop_addr, session["ton_address"]))
        amount_ton = amount_nano / 1e9
        
        text = f"💰 <b>Claimable Royalties</b>\n\n"
        if amount_ton > 0:
            text += f"You have <b>{amount_ton:.4f} TON</b> waiting for you!"
            markup = types.InlineKeyboardMarkup()
            # ClaimShare opcode is 0x1e367c3b. queryId = 0.
            # Constructing a simple claim link. Most wallets support "Claim" as a comment if the contract supports it,
            # but here we should ideally use the opcode.
            claim_url = f"ton://transfer/{drop_addr}?amount=50000000&text=Claim" # Using comment for simplicity if supported
            markup.add(types.InlineKeyboardButton("💸 Claim Now", url=claim_url))
            bot.send_message(message.chat.id, text, reply_markup=markup)
        else:
            text += "Nothing to claim at the moment."
            bot.send_message(message.chat.id, text)
    except Exception as exc:
        log.error("Claim error: %s", exc)
        bot.send_message(message.chat.id, "⚠️ Error checking claimables.")

@bot.message_handler(func=lambda m: m.text == "🗳️ Governance")
def btn_governance(message: types.Message):
    count = asyncio.run(get_governance_count())
    text = (
        "🗳️ <b>Governance</b>\n\n"
        f"There are <b>{count}</b> proposals in the system.\n"
    )
    
    markup = types.InlineKeyboardMarkup()
    if count > 0:
        markup.add(types.InlineKeyboardButton("📜 View Proposals", callback_data="view_proposals"))
    
    bot.send_message(message.chat.id, text, reply_markup=markup)

@bot.message_handler(commands=["connect"])
def cmd_connect(message: types.Message) -> None:
    args = (message.text or "").split(maxsplit=1)
    if len(args) < 2:
        bot.reply_to(message, "Usage: <code>/connect YOUR_TON_ADDRESS</code>")
        return
    
    ton_addr = args[1].strip()
    # Simple validation: check if it looks like a TON address (basic check)
    if len(ton_addr) < 40:
        bot.reply_to(message, "⚠️ Invalid TON address format.")
        return

    upsert_session(message.from_user.id, ton_addr, "")
    bot.reply_to(message, f"✅ Wallet <code>{ton_addr[:8]}…{ton_addr[-6:]}</code> connected.")

@bot.message_handler(commands=["tracks"])
def cmd_tracks(message: types.Message) -> None:
    tg_id = message.from_user.id
    rows = get_tracks_by_artist(tg_id)
    if not rows:
        bot.reply_to(message, "You have no registered tracks yet.")
        return

    lines = [f"<b>Your Tracks ({len(rows)}):</b>"]
    for row in rows:
        tid       = row["track_id"]
        ttl       = row["title"] if row["title"] else "(untitled)"
        price_ton = row["price"] / 1e9 if row["price"] else 0
        lines.append(f"• <code>{tid}</code> — {ttl} — {price_ton:.2f} TON")
    bot.reply_to(message, "\n".join(lines))

@bot.message_handler(commands=["price"])
def cmd_price(message: types.Message) -> None:
    price = asyncio.run(get_oracle_price())
    if price is None:
        bot.reply_to(message, "⚠️ Oracle unavailable or not configured.")
        return
    display = price / 1e9
    bot.reply_to(message, f"📈 TOON/TON: <b>{display:.6f} TON</b>")

@bot.message_handler(commands=["claimable"])
def cmd_claimable(message: types.Message) -> None:
    drop_addr = CONTRACT_ADDRS.get("drop", "")
    if not drop_addr:
        bot.reply_to(message, "DROP_ADDR is not configured.")
        return

    args = (message.text or "").split(maxsplit=1)
    ton_addr = None
    
    if len(args) < 2:
        session = get_session(message.from_user.id)
        if session:
            ton_addr = session["ton_address"]
        else:
            bot.reply_to(message, "Usage: <code>/claimable YOUR_TON_ADDRESS</code> or connect your wallet.")
            return
    else:
        ton_addr = args[1].strip()

    try:
        amount_nano = asyncio.run(get_claimable(drop_addr, ton_addr))
    except Exception as exc:
        log.error("get_claimable error: %s", exc)
        bot.reply_to(message, "⚠️ Error querying contract.")
        return

    amount_ton = amount_nano / 1e9
    if amount_ton == 0:
        bot.reply_to(message, f"Nothing claimable for <code>{ton_addr[:8]}…</code>")
    else:
        bot.reply_to(message, f"💰 Claimable royalties: <b>{amount_ton:.4f} TON</b>")

@bot.message_handler(commands=["balance"])
def cmd_balance(message: types.Message) -> None:
    tg_id = message.from_user.id
    session = get_session(tg_id)
    if not session:
        bot.reply_to(message, "Please connect your wallet first with /connect.")
        return

    master_addr = CONTRACT_ADDRS.get("jetton_master")
    if not master_addr:
        bot.reply_to(message, "Jetton Master address not configured.")
        return

    async def check():
        wallet_addr = await get_wallet_address(master_addr, session["ton_address"])
        if not wallet_addr:
            return 0
        return await get_jetton_balance(wallet_addr)

    try:
        balance_nano = asyncio.run(check())
        balance_toon = balance_nano / 1e9
        bot.reply_to(message, f"💎 Your TOON Balance: <b>{balance_toon:,.2f} TOON</b>")
    except Exception as exc:
        log.error("balance check error: %s", exc)
        bot.reply_to(message, "⚠️ Error checking balance.")

@bot.message_handler(commands=["register"])
def cmd_register(message: types.Message) -> None:
    # Usage: /register track_id "title" price_ton
    args = (message.text or "").split(maxsplit=3)
    if len(args) < 4:
        bot.reply_to(message, "Usage: <code>/register track_id \"Title\" price_ton</code>")
        return

    track_id = args[1]
    title = args[2].strip('"')
    try:
        price_ton = float(args[3])
    except ValueError:
        bot.reply_to(message, "Invalid price. Must be a number.")
        return

    add_track(track_id, message.from_user.id, 0, title, int(price_ton * 1e9))
    bot.reply_to(message, f"✅ Track <b>{title}</b> registered successfully!")

# ─────────────────────────────────────────────────────────────────────────────
# Callback Query Handler
# ─────────────────────────────────────────────────────────────────────────────

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call: types.CallbackQuery) -> None:
    data = call.data
    chat_id = call.message.chat.id
    message_id = call.message.message_id
    tg_id = call.from_user.id

    if data == "main_menu":
        text, markup = get_main_menu(tg_id)
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)
    
    elif data == "browse":
        show_browse(chat_id, message_id)
    
    elif data == "my_tracks":
        rows = get_tracks_by_artist(tg_id)
        if not rows:
            text = "You have no registered tracks yet."
        else:
            lines = [f"<b>Your Tracks ({len(rows)}):</b>"]
            for row in rows:
                tid       = row["track_id"]
                ttl       = row["title"] if row["title"] else "(untitled)"
                price_ton = row["price"] / 1e9 if row["price"] else 0
                lines.append(f"• <code>{tid}</code> — {ttl} — {price_ton:.2f} TON")
            text = "\n".join(lines)
        
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "price":
        price = asyncio.run(get_oracle_price())
        if price is None:
            text = "⚠️ Oracle unavailable or not configured."
        else:
            display = price / 1e9
            text = f"📈 TOON/TON: <b>{display:.6f} TON</b>"
        
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "claimable":
        session = get_session(tg_id)
        if not session:
            text = "Please connect your wallet first with /connect or via the menu."
        else:
            drop_addr = CONTRACT_ADDRS.get("drop", "")
            if not drop_addr:
                text = "DROP_ADDR is not configured."
            else:
                try:
                    amount_nano = asyncio.run(get_claimable(drop_addr, session["ton_address"]))
                    amount_ton = amount_nano / 1e9
                    if amount_ton == 0:
                        text = f"Nothing claimable at <code>{session['ton_address'][:8]}…</code>"
                    else:
                        text = f"💰 Claimable royalties: <b>{amount_ton:.4f} TON</b>\nAddress: <code>{session['ton_address']}</code>"
                except Exception as exc:
                    log.error("get_claimable error: %s", exc)
                    text = "⚠️ Error querying contract."
        
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "connect":
        bot.answer_callback_query(call.id)
        bot.send_message(chat_id, "Please use <code>/connect YOUR_TON_ADDRESS</code> to link your wallet.")
        return

    elif data == "profile":
        session = get_session(tg_id)
        text = (
            f"👤 <b>Your Profile</b>\n\n"
            f"Telegram ID: <code>{tg_id}</code>\n"
            f"Wallet: <code>{session['ton_address']}</code>"
        )
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "balance":
        session = get_session(tg_id)
        if not session:
            text = "Please connect your wallet first."
        else:
            master_addr = CONTRACT_ADDRS.get("jetton_master")
            if not master_addr:
                text = "Jetton Master address not configured."
            else:
                async def check():
                    wallet_addr = await get_wallet_address(master_addr, session["ton_address"])
                    if not wallet_addr: return 0
                    return await get_jetton_balance(wallet_addr)
                try:
                    balance_nano = asyncio.run(check())
                    balance_toon = balance_nano / 1e9
                    text = f"💎 Your TOON Balance: <b>{balance_toon:,.2f} TOON</b>"
                except Exception:
                    text = "⚠️ Error checking balance."
        
        markup = types.InlineKeyboardMarkup().add(
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "artist_studio":
        text = (
            "🎨 <b>Artist Studio</b>\n\n"
            "Manage your tracks and releases.\n\n"
            "Use <code>/register track_id \"Title\" price_ton</code> to add a new track."
        )
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(
            types.InlineKeyboardButton("🎸 My Tracks", callback_data="my_tracks"),
            types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu")
        )
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data == "view_proposals":
        count = asyncio.run(get_governance_count())
        if count == 0:
            text = "No proposals yet."
            markup = types.InlineKeyboardMarkup().add(types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu"))
        else:
            text = f"🗳️ <b>Active Proposals ({count})</b>\nSelect one to view details and vote:"
            markup = types.InlineKeyboardMarkup(row_width=1)
            # Show last 5 proposals
            for i in range(count, max(0, count-5), -1):
                p = asyncio.run(get_proposal(i))
                if p:
                    desc = p["description"][:30] + "..." if len(p["description"]) > 30 else p["description"]
                    markup.add(types.InlineKeyboardButton(f"#{i}: {desc}", callback_data=f"view_prop:{i}"))
            markup.add(types.InlineKeyboardButton("⬅️ Back", callback_data="main_menu"))
        bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)

    elif data.startswith("view_prop:"):
        prop_id = int(data.split(":")[1])
        p = asyncio.run(get_proposal(prop_id))
        if p:
            deadline_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(p["deadline"]))
            status = "✅ Executed" if p["executed"] else ("⌛ Active" if p["deadline"] > time.time() else "❌ Expired")
            
            text = (
                f"🗳️ <b>Proposal #{prop_id}</b>\n\n"
                f"<b>Description:</b> {p['description']}\n"
                f"<b>Status:</b> {status}\n"
                f"<b>Deadline:</b> {deadline_str}\n\n"
                f"👍 <b>Yes:</b> {p['yesVotes']/1e9:.2f} TOON\n"
                f"👎 <b>No:</b> {p['noVotes']/1e9:.2f} TOON"
            )
            
            markup = types.InlineKeyboardMarkup(row_width=2)
            if not p["executed"] and p["deadline"] > time.time():
                gov_addr = CONTRACT_ADDRS.get("governance", "")
                # CastVote: proposalId, support, weight. 
                # Weight is verified by Vault, so we just send the intent.
                # Constructing vote links
                yes_url = f"ton://transfer/{gov_addr}?amount=100000000&text=vote:{prop_id}:yes"
                no_url  = f"ton://transfer/{gov_addr}?amount=100000000&text=vote:{prop_id}:no"
                markup.add(
                    types.InlineKeyboardButton("👍 Vote Yes", url=yes_url),
                    types.InlineKeyboardButton("👎 Vote No", url=no_url)
                )
            
            markup.add(types.InlineKeyboardButton("⬅️ Back to Proposals", callback_data="view_proposals"))
            bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)
        else:
            bot.answer_callback_query(call.id, "Proposal not found.")

    elif data.startswith("view_track:"):
        track_id = data.split(":")[1]
        track = get_track_by_id(track_id)
        if track:
            title = track["title"] or "Untitled"
            price = track["price"] / 1e9 if track["price"] else 0
            text = (
                f"🎵 <b>Track Details</b>\n\n"
                f"Title: <b>{title}</b>\n"
                f"Price: <b>{price:.2f} TON</b>\n"
                f"ID: <code>{track_id}</code>"
            )
            
            markup = types.InlineKeyboardMarkup(row_width=1)
            treasury_addr = CONTRACT_ADDRS.get("treasury", "")
            if treasury_addr:
                # Standard TON transfer link for buying
                buy_url = f"ton://transfer/{treasury_addr}?amount={int(track['price'])}&text=buy_track:{track_id}"
                markup.add(types.InlineKeyboardButton("🛒 Buy Now", url=buy_url))
            
            markup.add(types.InlineKeyboardButton("⬅️ Back to Browse", callback_data="browse"))
            bot.edit_message_text(text, chat_id, message_id, reply_markup=markup)
        else:
            bot.answer_callback_query(call.id, "Track not found.")

    bot.answer_callback_query(call.id)


def main() -> None:
    log.info("Initialising database …")
    init_db()
    log.info("Starting ToonBot polling (Pure Chat Mode) …")
    bot.infinity_polling()


if __name__ == "__main__":
    main()

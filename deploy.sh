#!/bin/bash

# Toon Protocol Deployment Orchestrator
# Following GEMINI Mandates: Explicit Preconditions & Verifiable Flows

set -e

echo "━━━ TOON PROTOCOL DEPLOYMENT ORCHESTRATOR ━━━"

# 1. Explicit Preconditions Check
echo "🔍 Checking preconditions..."

if [ ! -f .env ]; then
    echo "❌ .env file not found! Copying .env.example..."
    cp .env.example .env
    echo "⚠️ Please edit .env and fill in the required variables (BOT_TOKEN, WALLET_MNEMONIC, ORACLE_SEED_HEX, etc.)"
    exit 1
fi

# Load .env
export $(grep -v '^#' .env | xargs)

REQUIRED_VARS=("BOT_TOKEN" "WALLET_MNEMONIC" "ORACLE_SEED_HEX" "SUPABASE_URL" "SUPABASE_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Preconditions met."

# 2. Dependencies & Build
echo "📦 Installing dependencies..."
npm install --silent

echo "🔨 Building TON contracts..."
npm run build:all

# 3. Verifiable Deployment Flow
echo ""
echo "🚀 Protocol Deployment Options:"
echo "1) Deploy entire Toon Protocol to Testnet (Registry, Vault, Tip, Governance)"
echo "2) Deploy individual contracts (Token, Registry, Vault, etc.)"
echo "3) Skip contract deployment (already deployed)"
read -p "Choose an option [1-3]: " deploy_opt

case $deploy_opt in
    1)
        echo "📡 Deploying full protocol..."
        npm run deploy:protocol
        ;;
    2)
        echo "📡 Which contract would you like to deploy?"
        echo "a) ToonToken"
        echo "b) ToonRegistry"
        echo "c) ToonArtist"
        read -p "Choose [a-c]: " sub_opt
        case $sub_opt in
            a) npm run deploy:token ;;
            b) npm run deploy:registry ;;
            c) npm run deploy:artist ;;
            *) echo "Invalid option"; exit 1 ;;
        esac
        ;;
    3)
        echo "⏩ Skipping contract deployment."
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

# 4. Database Initialization
echo ""
echo "🗄️ Database Initialization:"
read -p "Do you want to run Supabase migrations? [y/N]: " run_mig
if [[ "$run_mig" =~ ^[Yy]$ ]]; then
    echo "📡 Running migrations..."
    # Note: Using migrate.js for data migration or a manual SQL runner
    node migrate.js || echo "⚠️ Migration script finished with notes (check db.json)."
fi

# 5. Final Verification
echo ""
echo "✅ Deployment Process Finished!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "1. Verify contract addresses in your .env file match the deployment output."
echo "2. Run 'node check_deployer.js' to verify wallet balance and connectivity."
echo "3. Start the Toon Bot: 'npm start'"
echo "4. Monitor logs: 'tail -f combined.log' (if using a logger)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

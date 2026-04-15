const { Address } = require('@ton/core');

/**
 * @typedef {Object} ChainEvent
 * @property {string} type
 * @property {string} txHash
 * @property {number} lt
 * @property {number} timestamp
 * @property {Object} data
 */

const EVENT_TYPES = {
    ARTIST_REGISTERED: 'ArtistRegistered',
    TRACK_REGISTERED: 'TrackRegistered',
    MINT_AUTHORIZED: 'MintAuthorized',
    REWARD_CLAIMED: 'RewardClaimed',
    TIP_SENT: 'TipSent',
    POOL_CREATED: 'PoolCreated',
    CONTRIBUTION_RECEIVED: 'ContributionReceived'
};

module.exports = {
    EVENT_TYPES
};

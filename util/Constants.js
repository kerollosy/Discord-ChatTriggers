export const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"
export const DISCORD_API_URL = "https://discord.com/api/v10"
export const DISCORD_CDN_URL = "https://cdn.discordapp.com"

export const CURRENT_VERSION = "1.1.0"
export const USER_AGENT = `SIRENCE (www.chattriggers.com, ${CURRENT_VERSION})`;

export const ENDPOINTS = {
    SEND_MESSAGE: (id) => `${DISCORD_API_URL}/channels/${id}/messages`,
    DELETE_MESSAGE: (channelId, messageId) => `${DISCORD_API_URL}/channels/${channelId}/messages/${messageId}`,
}

// https://discord.com/developers/docs/topics/gateway-events
export const PACKETS = {
    // https://discord.com/developers/docs/topics/gateway-events#ready
    READY: "READY",

    // https://discord.com/developers/docs/topics/gateway-events#guild-create
    GUILD_CREATE: "GUILD_CREATE",

    // https://discord.com/developers/docs/topics/gateway-events#message-create
    MESSAGE_CREATE: "MESSAGE_CREATE",

    // https://discord.com/developers/docs/topics/gateway-events#message-delete
    MESSAGE_DELETE: "MESSAGE_DELETE"
}
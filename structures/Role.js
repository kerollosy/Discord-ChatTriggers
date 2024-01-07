/*
"version": 0,
"unicode_emoji": null,
"tags": {},
"position": 5,
"permissions": "1071698660937",
"name": "Ownerr",
"mentionable": false,
"managed": false,
"id": "941907037502193695",
"icon": null,
"hoist": true,
"flags": 0,
"color": 16711935
*/
/**
 * Represents a role in a guild in Discord.
 */
export class Role {
    /**
     * Creates a new Role instance.
     * @param {Object} data - The raw data object representing the role.
     * @param {Object} client - The Discord bot client associated with the role.
     */
    constructor(data, client) {
        this.client = client
    }
}
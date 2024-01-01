/**
 * Represents a guild (server) in Discord.
 */
export class Guild {
    /**
     * Creates a new Channel instance.
     * @param {Object} data - The raw data object representing the guild.
     */
    constructor(data) {
        /**
         * Copies properties from the data object to the guild instance.
         * @type {Object}
         */
        Object.assign(this, data);
    }
}
import { DISCORD_CDN_URL } from "../util/Constants";


/**
 * Represents a user in Discord.
 */
export class User {
    /**
     * Creates a new User instance.
     * @param {Object} data - The raw data object representing the user.
     * @param {Client} client - The Discord bot client associated with the user.
     */
    constructor(data, client) {
        /**
         * The Discord bot client associated with the user.
         * @type {Client}
         */
        this.client = client;

        /**
         * The username of the user.
         * @type {string}
         */
        this.username = data.username;

        /**
         * The unique identifier of the user.
         * @type {string}
         */
        this.id = data.id;

        /**
         * The discriminator of the user.
         * @type {string}
         */
        this.discriminator = data.discriminator;

        /**
         * The avatar of the user.
         * @type {string}
         */
        this.avatar = data.avatar;

        /**
         * Indicates whether the user is a bot.
         * @type {boolean}
         */
        this.bot = data.bot || false;

        /**
         * A dictionary containing information about the guilds the user is a member of.
         * @type {Object}
         */
        this.guilds = {}

        // Copy additional properties from data to the user object.
        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    /**
     * Returns the URL of the user's avatar.
     * @type {string|null}
     */
    get avatarURL() {
        if (!this.avatar) {
            return null
        } else {
            return `${DISCORD_CDN_URL}/avatars/${this.id}/${this.avatar}.png`
        }
    }

    /**
     * Returns a mention string for the user.
     * @returns {string} A mention string for the user in the format `<@user_id>`.
     */
    mention() {
        return `<@${this.id}>`
    }
}
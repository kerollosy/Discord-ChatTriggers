import { User } from "./User";
import { Channel } from "./Channel";
import { Guild } from "./Guild";


/**
 * Represents a message in Discord.
 */
export class Message {
    /**
     * Creates a Message instance.
     * @param {Object} data - The raw data object representing the message.
     * @param {Client} client - The Discord bot client associated with the message.
     */
    constructor(data, client) {
        /**
         * The Discord bot client associated with the message.
         * @type {Client}
         */
        this.client = client;

        /**
         * The channel where the message was sent.
         * @type {Channel}
         */
        this.channel = new Channel({ id: data.channel_id }, client);

        /**
         * The guild (server) where the message was sent.
         * @type {Guild}
         */
        if (data.guild_id)
            this.guild = new Guild(this.client.user.guilds[data.guild_id]);

        /**
         * The author of the message.
         * @type {User}
         */
        this.author = new User(data.author);

        /**
         * Array of attachments included in the message.
         * @type {Array}
         */
        this.attachments = data.attachments;

        /**
         * Whether the message is a text-to-speech (TTS) message.
         * @type {boolean}
         */
        this.tts = data.tts

        /**
         * Array of embed objects included in the message.
         * @type {Array}
         */
        this.embeds = data.embeds;

        /**
         * The timestamp when the message was created.
         * @type {number}
         */
        this.timestamp = Date.parse(data.timestamp);

        /**
         * The unique identifier of the message.
         * @type {string}
         */
        this.id = data.id;

        /**
         * The content of the message.
         * @type {string}
         */
        this.content = data.content;

        /**
         * The timestamp when the message was last edited.
         * @type {number|undefined}
         */
        if (data.edited_timestamp)
            this.editedTimestamp = Date.parse(data.edited_timestamp);

        /**
         * Array of users mentioned in the message.
         * @type {Array}
         */
        this.mentions = [];

        if (data.mentions) {
            data.mentions.forEach(mention => {
                this.mentions.push(new User(mention));
            })
        }

        // Copy additional properties from data to the message object.
        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    /**
     * Sends a reply to the channel where the message was received.
     * @param {string} content - The content of the reply message.
     * @param {Object} options - Additional options for sending the reply.
     * @param {boolean} options.tts - Whether the reply should be sent as text-to-speech (TTS). Defaults to false.
     */
    reply(content, options = {}) {
        this.channel.send(content, options);
    }

    /**
     * Deletes the message.
     * @returns {Promise<void>} A promise that resolves with the response if the message is successfully deleted.
     */
    delete() {
        return this.client.delete_message(this);
    }
    
    /**
     * Returns a string representation of the message.
     * @returns {string} The content of the message.
     */
    toString() {
        return this.content
    }
}
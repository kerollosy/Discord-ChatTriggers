import { User } from "./User";
import { ENDPOINTS } from "../util/Constants";
import { Promise } from "../../PromiseV2"

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
        this.channel = client.channels?.get(data.channel_id);

        /**
         * The guild (server) where the message was sent.
         * @type {Guild}
         */
        this.guild = client.guilds?.get(data.guild_id);

        /**
         * The author of the message.
         * @type {User}
         */
        this.author = client.users?.get(data.author.id);

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
        return new Promise((resolve, reject) => {
            this.client.send_request(ENDPOINTS.DELETE_MESSAGE(this.channel.id, this.id), "DELETE",
                {
                    json: false
                }
            ).then((response) => {
                this.channel.messages.delete(this.id)
                return resolve(response)
            }).catch((error) => {
                console.error(`An error occured while deleting message "${this.content}": ${JSON.stringify(error)}`)
                return reject(error)
            })
        })
    }

    /**
     * Returns a string representation of the message.
     * @returns {string} The content of the message.
     */
    toString() {
        return this.content
    }
}
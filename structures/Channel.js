import Collection from "../util/Collection";


/**
 * Represents a text channel in Discord.
 */
export class Channel {
    /**
     * Creates a new Channel instance.
     * @param {Object} data - The raw data object representing the channel.
     * @param {Client} client - The Discord bot client associated with the channel.
     */
    constructor(data, client) {
        /**
         * The unique identifier of the channel.
         * @type {string}
         */
        this.id = data.id;

        /**
         * The type of the channel.
         * @type {int}
         */
        this.type = data.type;

        /**
         * The Discord bot client associated with the channel.
         * @type {Client}
         */
        this.client = client;

        /**
         * A collection of messages in the channel.
         * @type {Collection}
         */
        this.messages = new Collection()


        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    /**
     * Sends a message to the channel.
     * @see https://discohook.org/
     * @param {string|Object} options The options for sending the message. If a string, it is the content of the message. If an object, it can have the following properties:
     *   - embeds (Array<Object>): An array of Discord Embeds to include in the message.
     *   - tts (Boolean): Whether the message should be read aloud using text-to-speech.
     *   - content (string): The text content of the message.
     */
    send(options) {
        this.client.send_message(options, this.id);
    }
}
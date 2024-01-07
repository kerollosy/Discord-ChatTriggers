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
         * The Discord bot client associated with the channel.
         * @type {Client}
         */
        this.client = client;

        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    /**
     * Sends a message to the channel.
     * @param {string} content - The content of the message.
     * @param {Object} options - The options for sending the message (optional).
     * @param {boolean} options.tts - Whether the message should be sent as text-to-speech (TTS). Defaults to false.
     */
    send(content, options = {}) {
        this.client.send_message(content, this.id, options);
    }
}
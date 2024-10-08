import Collection from "../util/Collection";
import { ENDPOINTS } from "../util/Constants";
import { Promise } from "../../PromiseV2"
import { Message } from "./Message";
import { Webhook } from "./Webhook";

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
         * @type {Collection<Message>}
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
     *   - files (Array<string>): An array of file paths to include in the message.
     * @returns {Promise<Message>} A Promise that resolves with the sent message if successful.
     */
    send(options) {
        let [body, files] = this.client.payloadCreator.resolveMessage(options);

        return new Promise((resolve, reject) => {
            this.client.send_request(ENDPOINTS.SEND_MESSAGE(this.id), "POST",
                {
                    body: body,
                    files: files
                }
            ).then((response) => {
                return resolve(new Message(response, this.client));
            }).catch(error => {
                console.error(`An error occured while sending message "${body.content}": ${JSON.stringify(error)}`);
                return reject(error);
            });
        });
    }

    /**
     * Creates a webhook in the channel.
     * @param {string} name - The name of the webhook.
     * @param {string} [avatar=null] - The avatar of the webhook.
     * @param {string} [reason=null] - The reason for creating the webhook.
     * @returns {Promise<Webhook>} A Promise that resolves with the created webhook if successful.
     */
    createWebhook({ name, avatar = null, reason = null }) {
        if (typeof avatar == 'string' && !avatar.startsWith('data:')) {
            avatar = resolveImage(avatar);
        }

        return new Promise((resolve, reject) => {
            this.client.send_request(ENDPOINTS.CREATE_WEBHOOK(this.id), "POST",
                {
                    body: {
                        name: name,
                        avatar: avatar
                    },
                    reason: reason
                }
            ).then((response) => {
                return resolve(new Webhook(response, this.client))
            }).catch((error) => {
                console.error(`An error occured while creating webhook "${name}": ${JSON.stringify(error)}`)
                return reject(error)
            })
        })
    }
}
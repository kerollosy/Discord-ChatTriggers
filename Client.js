import request from "../requestV2"
import { Message } from "./structures/Message";
import { ENDPOINTS } from "./util/Constants";
import { EventEmitter } from "./util/EventEmitter";
import { WsClient } from "./util/WsClient";
import { MessageHandler } from "./util/MessageHandler";
import { Payload } from "./util/Payload";
import { Promise } from "../PromiseV2"
import { Collection } from "./util/Collection";


/**
 * Represents a client that connects to the Discord API.
 * @extends EventEmitter
 */
export class Client extends EventEmitter {
    /**
     * Creates a new Client instance.
     * @param {Object} options - The options for the client.
     * @param {string} options.token - The bot token for authentication.
     * @param {number} options.intents - The bitwise value representing the bot's intents. Defaults to 3276799.
     *                                  (For more information, see https://discord-intents-calculator.vercel.app/)
     */
    constructor(options = {}) {
        super()

        /**
         * An instance of the MessageHandler for processing incoming messages.
         * @type {MessageHandler}
         */
        this.messageHandler = new MessageHandler(this)

        /**
         * An instance of the WsClient for handling communication with the Discord Gateway.
         * @type {WsClient|null}
         */
        this.ws = null

        /**
         * An instance of Payload for making API request payloads.
         * @type {Payload|null}
         */
        this.payloadCreator = null

        /**
         * The bot token for authentication.
         * @type {string|null}
         */
        this.token = options.token || null

        /**
         * The bitwise value representing the bot's intents.
         * @type {number}
         */
        this.intents = options.intents || 0

        /**
         * Indicates whether the client is ready and connected to Discord.
         * @type {boolean}
         */
        this.ready = false

        /**
         * The time when the client became ready.
         * @type {number|null}
         */
        this.readyTime = null

        /**
         * The current state of the client.
         * @type {string}
         */
        this.state = "DISCONNECTED"

        /**
         * The sequence number for the last received message.
         * @type {number|null}
         */
        this.s = null

        /**
         * A collection of all users the client is aware of.
         * @type {Collection<string, User>}
         */
        this.users = new Collection()

        /**
         * A collection of all guilds (servers) the client has access to.
         * @type {Collection<string, Guild>}
         */
        this.guilds = new Collection()

        /**
         * A collection of all channels the client has access to.
         * @type {Collection<string, Channel>}
         */
        this.channels = new Collection()
    }

    /**
     * Gets the uptime of the client.
     * @returns {number|null} The uptime of the client in milliseconds, or null if the client is not ready.
     */
    get uptime() {
        return this.ready ? Date.now() - this.readyTime : null;
    }

    /**
     * Logs the client in using a token.
     * @param {string} [token] - The token to log in with.
     * @returns {Promise<string>} A promise that resolves with the token if successful.
     * @throws {Error} If no token is provided.
     */
    login(token = this.token) {
        return new Promise((resolve, reject) => {
            if (!token) {
                return reject(new Error("No token provided"))
            }

            if (this.state !== "DISCONNECTED") {
                return reject(new Error("Client is already connected"))
            }
            this.state = "CONNECTED"

            this.token = token

            this.payloadCreator = new Payload(this.token)

            this.ws = new WsClient(this.token, this.intents)
            this.ws.connect()

            this.heartbeat = register("step", () => {
                if (!this.ready) return
                this.ws.send(JSON.stringify({ "op": 1, "d": this.s }))
            })

            register("gameUnload", () => {
                this.ws.close()
            })

            this.ws.on("_message", (message) => {
                this.messageHandler.handle(message)
            })

            return resolve(this.token)
        })
    }

    /**
     * Sends a message to a Discord channel.
     * @param {string} message - The content of the message to be sent.
     * @param {string} channel_id - The ID of the Discord channel where the message will be sent.
     * @param {Object} options - Additional options for sending the message.
     * @param {boolean} options.tts - Whether the message should be sent as text-to-speech (TTS). Defaults to false.
     * @returns {Promise<Message>} A Promise that resolves with the sent message if successful.
     */
    send_message(message, channel_id, options = {}) {
        let message_payload = this.payloadCreator.create(
            ENDPOINTS.SEND_MESSAGE(channel_id),
            'POST',
            {
                "content": message,
                "tts": options.tts || false
            },
            true
        )

        return new Promise((resolve, reject) => {
            request(message_payload)
                .then(function (response) {
                    return resolve(new Message(response, this))
                })
                .catch(function (error) {
                    console.error(`An error occured while sending message "${message}": ${JSON.stringify(error)}`)
                    return reject(error)
                })
        })
    }

    /**
     * Deletes a message from a Discord channel.
     * @param {Message} message - The message to be deleted.
     * @param {Object} options - Additional options for deleting the message.
     * @returns {Promise<any>} A promise that resolves with the response if the message is successfully deleted.
     * @throws {Error} If an error occurs during the delete message process.
     */
    delete_message(message, options = {}) {
        let delete_message_payload = this.payloadCreator.create(
            ENDPOINTS.DELETE_MESSAGE(message.channel.id, message.id),
            'DELETE',
            null,
            false
        )

        return new Promise((resolve, reject) => {
            request(delete_message_payload)
                .then(function (response) {
                    message.channel.messages.delete(message.id)
                    return resolve(response)
                })
                .catch(function (error) {
                    console.error(`An error occured while deleting message "${message}": ${JSON.stringify(error)}`)
                    return reject(error)
                })
        })
    }
}

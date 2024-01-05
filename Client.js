import request from "../requestV2"
import { Message } from "./structures/Message";
import { DISCORD_API_URL } from "./util/Constants";
import { EventEmitter } from "./util/EventEmitter";
import { WsClient } from "./util/WsClient";
import { MessageHandler } from "./util/MessageHandler";
import { Promise } from "../PromiseV2"


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
         * The bot token for authentication.
         * @type {string|null}
         */
        this.token = options.token || null

        /**
         * The bitwise value representing the bot's intents.
         * @type {number}
         */
        this.intents = options.intents || 3276799

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

            if(this.state !== "DISCONNECTED") {
                return reject(new Error("Client is already connected"))
            }
            this.state = "CONNECTED"

            this.token = token

            /**
             * An instance of the WsClient for handling communication with the Discord Gateway.
             * @type {WsClient}
             */
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
     * @returns {Message} A Message object representing the sent message.
     */
    send_message(message, channel_id, options = {}) {
        let message_payload = {
            url: `${DISCORD_API_URL}/channels/${channel_id}/messages`,
            method: 'POST',
            headers: {
                'Authorization': 'Bot ' + this.token,
                "User-Agent": "DiscordBot (www.chattriggers.com, 1.0.0)"
            },
            body: {
                "content": message,
                "tts": options.tts || false
            },
            json: true
        }
        request(message_payload)
            .then(function (response) {
                return new Message(response, this)
            })
            .catch(function (error) {
                console.error(`An error occured while sending message "${message}": ${JSON.stringify(error)}`)
            })
    }
}

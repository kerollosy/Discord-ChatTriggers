import request from "../requestV2"
import { EventEmitter } from "./util/EventEmitter";
import { WsClient } from "./util/WsClient";
import { MessageHandler } from "./util/MessageHandler";
import { Payload } from "./util/Payload";
import { Promise } from "../PromiseV2"
import { Collection } from "./util/Collection";
import { Webhook } from "./structures/Webhook";


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
        this.payloadCreator = new Payload()

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
         * @type {Collection<User>}
         */
        this.users = new Collection()

        /**
         * A collection of all guilds (servers) the client has access to.
         * @type {Collection<Guild>}
         */
        this.guilds = new Collection()

        /**
         * A collection of all channels the client has access to.
         * @type {Collection<Channel>}
         */
        this.channels = new Collection()

        /**
         * The session ID used to reconnect
         * @type {String|null}
         */
        this.session_id = null

        /**
         * The URL to resume the gateway connection.
         *  @type {String|null}
         */
        this.resume_gateway_url = null

        /**
         * Indicates whether the client is currently reconnecting to the gateway.
         */
        this.reconnecting = false;

        /**
         * The heartbeat interval for the client.
         */
        this.heartbeat = register("step", () => {
            if (!this.ready) return
            this.ws.send(JSON.stringify({ "op": 1, "d": this.s }))
        })

        /**
         * Registers an event listener to close the websocket on gameUnload event.
         */
        register("gameUnload", () => {
            this.ws.close()
        })
    }

    /**
     * Gets the uptime of the client.
     * @returns {number|null} The uptime of the client in milliseconds, or null if the client is not ready.
     */
    get uptime() {
        return this.ready ? Date.now() - this.readyTime : null;
    }

    /**
     * Starts a new WebSocket connection.
     * @param {string} [token] - The token to start the connection with.
     * @throws {Error} If no token is provided.
     */
    startNewConnection(token = this.token) {
        if (!token) {
            throw new Error("No token provided");
        }

        if (this.ready) {
            throw new Error("Client is already connected")
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.ws = new WsClient(token, this.intents);
        this.ws.connect();

        this.ws.on("_message", (message) => {
            this.messageHandler.handle(message);
        });

        this.ws.on("close", (code) => {
            if (code == 1000) return // When the connection is closed with no errors it closes with code 1000
            if (this.reconnecting) return

            this.reconnecting = true;
            this.ready = false
            const reconnection_trigger = register("step", () => {
                // console.log(this.ready)
                this.login()
                if (this.ready) {
                    reconnection_trigger.unregister()
                }
            }).setDelay(5)

            this.emit("debug", `Connection closed with code ${code}`);
            this.emit("debug", "Attempting to reconnect...");
            this.startNewConnection(token);

        });
    }

    /**
     * Logs the client in using a token.
     * @param {string} [token] - The token to log in with.
     * @returns {Promise<string>} A promise that resolves with the token if successful.
     * @throws {Error} If no token is provided.
     */
    login(token = this.token) {
        return new Promise((resolve, reject) => {
            try {
                this.token = token
                this.payloadCreator.setToken(this.token)
                this.startNewConnection(token)
                return resolve(this.token)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Sends a request to an endpoint.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {string} method - The HTTP method to use for the request.
     * @param {Object} options - Optional options
     * @returns {Promise<any>} A promise that resolves with the response if the request is successful.
     */
    send_request(endpoint, method, options = {}) {
        if (options.reason) {
            options.headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason)
        }

        let payload = this.payloadCreator.create(endpoint, method, options.body, options.json, options.headers)

        return new Promise((resolve, reject) => {
            request(payload)
                .then(function (response) {
                    return resolve(response)
                })
                .catch(function (error) {
                    return reject(error)
                })
        })
    }

    /**
     * Gets a webhook by its URL.
     * @param {string} url - The URL of the webhook to get.
     * @returns {Promise<Webhook>} A promise that resolves with the webhook if successful.
     */
    getWebhook(url) {
        return new Promise((resolve, reject) => {
            this.send_request(url, "GET")
                .then((response) => {
                    return resolve(new Webhook(response, this))
                })
                .catch((error) => {
                    console.error(`An error occured while getting webhook "${url}": ${JSON.stringify(error)}`)
                    return reject(error)
                })
        })
    }
}

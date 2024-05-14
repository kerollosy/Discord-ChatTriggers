import WebSocket from "../../WebSocket";
import { GATEWAY_URL } from "./Constants";
import { EventEmitter } from "./EventEmitter";

/**
 * Represents a WebSocket client for handling communication with the Discord Gateway.
 * @extends EventEmitter
 */
export class WsClient extends EventEmitter {
    /**
     * Creates a new WsClient instance.
     * @param {string} token - The bot token for authentication.
     * @param {number} intents - The bitwise value representing the bot's intents. (https://discord-intents-calculator.vercel.app/)
     * @param {string} [url=GATEWAY_URL] - The URL of the Discord Gateway.
     */
    constructor(token, intents, url = GATEWAY_URL) {
        super();
        /**
         * An instance of the WebSocket for communicating with the Discord Gateway.
         * @type {WebSocket}
         */
        this.ws = new WebSocket(url);

        /**
         * The bot token for authentication.
         * @type {string}
         */
        this.token = token;

        /**
         * The bitwise value representing the bot's intents.
         * @type {number}
         */
        this.intents = intents;
    }

    /**
     * Initiates a connection to the Discord Gateway and sets up event handlers.
     */
    connect() {
        this.ws.onOpen = () => {
            this.sendIdentificationPayload()
        }

        this.ws.connect()

        this.ws.onMessage = (message) => {
            this.emit("_message", message)
        }

        this.ws.onError = (error) => {
            console.error(`An error occured: ${error}`)
        }

        this.ws.onClose = (code, reason, remote) => {
            this.emit("close", code)
        }
    }

    /**
     * Sends the identification payload to the Discord Gateway upon successful connection.
     */
    sendIdentificationPayload() {
        let payload = {
            "op": 2,
            "d": {
                "token": this.token,
                "intents": this.intents,
                "properties": {
                    "os": 'linux',
                    "browser": "Discord.mc",
                    "device": "Discord.mc"
                }
            }
        }
        this.send(JSON.stringify(payload))
    }

    /**
     * Sends a message to the Discord Gateway.
     * @param {string} message - The JSON message to send.
     */
    send(message) {
        this.ws.send(message)
    }

    /**
     * Closes the WebSocket connection to the Discord Gateway.
     */
    close() {
        this.ws.close()
    }
}

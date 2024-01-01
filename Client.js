import axios from "../axios"
import { Message } from "./structures/Message";
import { DISCORD_API_URL } from "./util/Constants";
import { EventEmitter } from "./util/EventEmitter";
import { WsClient } from "./util/WsClient";
import { MessageHandler } from "./util/MessageHandler";


export class Client extends EventEmitter {
    constructor(options = {}) {
        super()
        this.messageHandler = new MessageHandler(this)
        this.token = options.token || null
        this.intents = options.intents || 3276799
        this.ready = false
        this.s = null
    }

    login(token = this.token) {
        if (!token) throw new Error("No token provided");
        this.token = token

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
    }

    send_message(message, channel_id, options = {}) {
        let message_payload = {
            url: `${DISCORD_API_URL}/channels/${channel_id}/messages`,
            headers: {
                'Authorization': 'Bot ' + this.token,
                "User-Agent": "DiscordBot (www.chattriggers.com, 1.0.0)"
            },
            body: {
                "content": message,
                "tts": options.tts || false
            }
        }
        axios.post(message_payload)
            .then(function (response) {
                return new Message(response.data, this)
            })
            .catch(function (error) {
                console.log(`An error occured while sending message "${message}": ${JSON.stringify(error)}`)
            })
    }
}

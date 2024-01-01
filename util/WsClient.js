import WebSocket from "../../WebSocket";
import { GATEWAY_URL } from "./Constants";
import { EventEmitter } from "./EventEmitter";

export class WsClient extends EventEmitter {
    constructor(token, intents) {
        super();
        this.ws = new WebSocket(GATEWAY_URL);
        this.token = token;
        this.intents = intents;
    }

    connect() {
        this.ws.onOpen = () => {
            this.sendIdentificationPayload()
        }

        this.ws.connect()

        this.ws.onMessage = (message) => {
            this.emit("_message", message)
        }

        this.ws.onError = (error) => {
            console.log(`An error occured: ${error}`)
        }
    }

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

    send(message) {
        this.ws.send(message)
    }

    close() {
        this.ws.close()
    }
}

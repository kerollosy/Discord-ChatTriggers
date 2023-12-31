import WebSocket from "../WebSocket";
import axios from "../axios"
import { Message } from "./structures/Message";
import { GATEWAY_URL, DISCORD_API_URL } from "./util/Constants";
import { EventEmitter } from "./util/EventEmitter";
import { User } from "./structures/User";


export class Client extends EventEmitter {
    constructor(options = {}) {
        super()
        this.ws = new WebSocket(GATEWAY_URL)
        this.token = options.token || null
        this.intents = options.intents || 3276799
        this.ready = false
        this.heartbeat_interval = null
        this.s = null
    }


    login(token) {
        this.token = token
        this.ws.onOpen = () => {
            let payload = {
                "op": 2,
                "d": {
                    "token": this.token,
                    "intents": this.intents,
                    "properties": {
                        "os": 'linux',
                        "browser": "chrome",
                        "device": "device"
                    }
                }
            }
            this.ws.send(JSON.stringify(payload))
        }

        this.ws.connect()

        this.ws.onMessage = (message) => {
            this.messageHandler(message)
        }

        this.ws.onError = (error) => {
            console.log(`An error occured: ${error}`)
            ChatLib.chat(`&eAn error occured: &c${error}&r`)
        }

        this.heartbeat = register("step", () => {
            if (!this.ready) return
            this.ws.send(JSON.stringify({ "op": 1, "d": this.s }))
        })

        register("gameUnload", () => {
            this.ws.close()
        })
    }

    messageHandler(message) {
        let json = JSON.parse(message);
        let op = json.op;
        let t = json.t;
        this.s = json.s;
        // console.log(message)

        switch (op) {
            // 10: Hello
            case 10:
                this.heartbeat_interval = json.d.heartbeat_interval;
                this.ready = true;
                this.heartbeat.setDelay(this.heartbeat_interval / 1000);
                break;
            // 11: Heartbeat ACK
            case 11:
                // console.log("Heartbeating..");
                break;
            // 1: Heartbeat
            case 1:
                ChatLib.chat(json);
                this.ws.send(JSON.stringify({ "op": 1, "d": this.s }));
                break;
        }

        switch (t) {
            case "MESSAGE_CREATE":
                let msg = new Message(json.d, this);
                this.emit("message", msg);
                break;

            case "READY":
                this.user = new User(json.d.user, this)
                json.d.guilds.forEach(guild => {
                    this.user.guilds[guild.id] = { unavailabe: true }
                });
                this.emit("ready", this.user);
                break;

            case "GUILD_CREATE":
                this.user.guilds[json.d.id] = json.d;
                break;
        }
    }

    send_message(message, channel_id) {
        let message_payload = {
            url: `${DISCORD_API_URL}/channels/${channel_id}/messages`,
            headers: {
                'Authorization': 'Bot ' + this.token,
                "User-Agent": "DiscordBot (www.chattriggers.com, 1.0.0)"
            },
            body: {
                "content": message
            }
        }
        axios.post(message_payload)
            .then(function (response) {
                return new Message(response.data, this)
            })
            .catch(function (error) {
                ChatLib.chat(`&eAn error occured while sending message "&a${message}&e": &c${error}&r`)
                console.log(`An error occured while sending message "${message}": ${error}`)
            })
    }
}

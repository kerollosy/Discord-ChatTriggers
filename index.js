import WebSocket from "../WebSocket";
import request from "../requestV2"
import { TOKEN } from './config.js'

let BOT_TOKEN = TOKEN

class Client {
    constructor(intents = 3276799) {
        const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"
        this.ws = new WebSocket(GATEWAY_URL)
        this.intents = intents
        this.ready = false
        this.heartbeat_interval = null
        this.s = null
        this.BOT_TOKEN = null

        this.user = {
            username: null,
            id: null,
            avatar: null,
            discriminator: null,
            email: null,
            guilds: {}
        }
        this.events = {}
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }


    login(token) {
        this.BOT_TOKEN = token
        this.ws.onOpen = () => {
            let payload = {
                "op": 2,
                "d": {
                    "token": this.BOT_TOKEN,
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
            ChatLib.chat(`An error occured: ${error}`)
        }

        this.heartbeat = register("step", () => {
            if (!this.ready) return
            this.ws.send(JSON.stringify({ "op": 1, "d": this.s }))
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
                console.log(message)
                this.emit("message", {
                    ...json.d,
                    channel: {
                        send: (content) => {
                            this.send_message(content, json.d.channel_id)
                        }
                    },
                    guild: this.user.guilds[json.d.guild_id],
                    author: json.d.author
                });
                break;

            case "READY":
                this.user.id = json.d.user.id;
                this.user.username = json.d.user.username;
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
            url: `https://discord.com/api/v10/channels/${channel_id}/messages`,
            method: "POST",
            headers: {
                'Authorization': 'Bot ' + this.BOT_TOKEN,
                "User-Agent": "DiscordBot (www.chattriggers.com, 1.0.0)"
            },
            body: {
                "content": message
            }
        }
        request(message_payload)
            .then(function (response) {
                console.log(response)
                return response
            })
            .catch(function (error) {
                ChatLib.chat(`An error occured while sending message "${message}": ${error}`)
                console.log(`An error occured while sending message "${message}": ${error}`)
            })
    }
}

let client = new Client();
client.login(BOT_TOKEN);

client.on("message", (message) => {
    if (message.author.bot) return
    console.log("A new message was created:", message.content);
    if (message.content === '!ping') {
        // Send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    } else if (message.content === `!server`) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.member_count}`);
    } else if (message.content === `!user-info`) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
});

client.on("ready", (user) => {
    console.log("The client is ready. User:", user.username);
});
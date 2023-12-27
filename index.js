import WebSocket from "../WebSocket";
import axios from "../axios"
import { TOKEN } from './config.js'

const DISCORD_API_URL = "https://discord.com/api/v10"
let BOT_TOKEN = TOKEN

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.avatar = data.avatar;
        this.discriminator = data.discriminator;
        this.bot = data.bot || false;
    }
}

class Guild {
    constructor(data) {
        Object.assign(this, data);
    }
}

class Channel {
    constructor(data, client) {
        this.id = data.id;
        this.type = data.type;
        this.client = client;
    }

    send(content) {
        this.client.send_message(content, this.id);
    }
}

class Message {
    constructor(data, client) {
        this.id = data.id;
        this.content = data.content;
        this.author = new User(data.author);
        this.channel = new Channel({ id: data.channel_id }, client);
        this.guild = new Guild(client.user.guilds[data.guild_id]);
    }

    reply(content) {
        this.channel.send(content);
    }
}

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
            console.log(`An error occured: ${error}`)
            ChatLib.chat(`&eAn error occured: &c${error}&r`)
        }

        this.heartbeat = register("step", () => {
            if (!this.ready) return
            this.ws.send(JSON.stringify({ "op": 1, "d": this.s }))
        })

        register("gameUnload", () => {
            client.ws.close()
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
            url: `${DISCORD_API_URL}/channels/${channel_id}/messages`,
            headers: {
                'Authorization': 'Bot ' + this.BOT_TOKEN,
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

let client = new Client();
client.login(BOT_TOKEN);

client.on("message", (message) => {
    if (message.author.bot) return
    // console.log(message)
    console.log("A new message was created:", message.content);
    if (message.content === '!ping') {
        // Send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    } else if (message.content === `!server`) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.member_count}`);
    } else if (message.content === `!user-info`) {
        message.reply(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
});

client.on("ready", (user) => {
    console.log("The client is ready. User:", user.username);
});


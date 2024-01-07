import { Message } from "../structures/Message";
import { User } from "../structures/User";
import { Guild } from "../structures/Guild";
import { PACKETS } from "./Constants";


/**
 * Handles incoming messages from the Discord Gateway and dispatches corresponding events.
 */
export class MessageHandler {
    /**
     * Creates a new MessageHandler instance.
     * @param {Client} client - The Discord bot client associated with the message handler.
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Handles an incoming message from the Discord Gateway and dispatches events accordingly.
     * @param {string} message - The JSON-formatted message received from the Gateway.
     */
    handle(message) {
        let json = JSON.parse(message);
        let op = json.op;
        let t = json.t;
        let data = json.d;
        this.client.s = json.s;

        switch (op) {
            // 10: Hello
            case 10:
                let heartbeat_interval = data.heartbeat_interval;
                this.client.heartbeat.setDelay(heartbeat_interval / 1000);
                break;
            // 11: Heartbeat ACK
            case 11:
                this.client.emit("debug", "Heartbeat ACK");
                break;
            // 1: Heartbeat
            case 1:
                this.client.ws.send(JSON.stringify({ "op": 1, "d": this.client.s }));
                break;
        }

        switch (t) {
            case PACKETS.MESSAGE_CREATE:
                let channel = this.client.channels.get(data.channel_id);
                if (channel) {
                    let msg = channel.messages.set(data.id, new Message(data, this.client));
                    this.client.emit("message", msg);
                } else {
                    this.client.emit("debug", `Received message for unknown channel ${data.channel_id}`);
                }
                break;
            
            case PACKETS.MESSAGE_DELETE:
                channel = this.client.channels.get(data.channel_id);
                if(channel) {
                    let msg = channel.messages.get(data.id);
                    if(msg) {
                        channel.messages.delete(data.id);
                        this.client.emit("messageDelete", msg);
                    } else {
                        this.client.emit("debug", `Received delete message for unknown message ${data.id}`);
                    }
                } else {
                    this.client.emit("debug", `Received delete message for unknown channel ${data.channel_id}`);
                }
                break;

            case PACKETS.READY:
                this.client.ready = true;
                this.client.readyTime = Date.now();
                this.client.user = this.client.users.set(data.id, new User(data.user, this.client));
                data.guilds.forEach(guild => {
                    this.client.guilds.set(guild.id, { unavailabe: true });
                });
                this.client.emit("ready", this.client.user);
                this.client.emit("debug", `Cached ${this.client.guilds.size} servers`);
                break;

            case PACKETS.GUILD_CREATE:
                this.client.guilds.set(data.id, new Guild(data, this.client));
                break;
        }
    }
}


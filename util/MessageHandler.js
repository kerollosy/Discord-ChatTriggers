import { Message } from "../structures/Message";
import { User } from "../structures/User";


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
        this.client.s = json.s;

        switch (op) {
            // 10: Hello
            case 10:
                let heartbeat_interval = json.d.heartbeat_interval;
                this.client.ready = true;
                this.client.heartbeat.setDelay(heartbeat_interval / 1000);
                break;
            // 11: Heartbeat ACK
            case 11:
                // console.log("Heartbeating..");
                break;
            // 1: Heartbeat
            case 1:
                this.client.ws.send(JSON.stringify({ "op": 1, "d": this.client.s }));
                break;
        }

        switch (t) {
            case "MESSAGE_CREATE":
                let msg = new Message(json.d, this.client);
                this.client.emit("message", msg);
                break;

            case "READY":
                this.client.user = new User(json.d.user, this.client);
                json.d.guilds.forEach(guild => {
                    this.client.user.guilds[guild.id] = { unavailabe: true };
                });
                this.client.emit("ready", this.client.user);
                break;

            case "GUILD_CREATE":
                this.client.user.guilds[json.d.id] = json.d;
                break;
        }
    }
}

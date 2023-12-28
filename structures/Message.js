// Description: This file contains the Message structure.
import { User } from "./User";
import { Channel } from "./Channel";
import { Guild } from "./Guild";

export class Message {
    constructor(data, client) {
        this.client = client;
        this.channel = new Channel({ id: data.channel_id }, client);
        this.guild = new Guild(client.user.guilds[data.guild_id]);
        this.author = new User(data.author);
        this.attachments = data.attachments;
        this.tts = data.tts
        this.embeds = data.embeds;
        this.timestamp = Date.parse(data.timestamp);
        this.id = data.id;
        this.content = data.content;
        // this.mentions = [];

        // data.mentions.forEach(mention => {
        //     this.mentions.push(mention);
        // })
    }

    reply(content) {
        this.channel.send(content);
    }
}
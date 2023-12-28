import { DISCORD_CDN_URL } from "../util/Constants";

export class User {
    constructor(data, client) {
        this.client = client;
        this.username = data.username;
        this.id = data.id;
        this.discriminator = data.discriminator;
        this.avatar = data.avatar;
        this.bot = data.bot || false;
    }

    get avatarURL(){
        if(!this.avatar) {
            return null
        } else {
            return `${DISCORD_CDN_URL}/avatars/${this.id}/${this.avatar}.png`
        }
    }

    mention() {
        return `<@${this.id}>`
    }
}
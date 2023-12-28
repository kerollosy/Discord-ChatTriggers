export class Channel {
    constructor(data, client) {
        this.id = data.id;
        this.type = data.type;
        this.client = client;
    }

    send(content) {
        this.client.send_message(content, this.id);
    }
}
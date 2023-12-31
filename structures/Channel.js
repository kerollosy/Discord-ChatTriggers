export class Channel {
    constructor(data, client) {
        this.id = data.id;
        this.type = data.type;
        this.client = client;

        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    send(content) {
        this.client.send_message(content, this.id);
    }
}
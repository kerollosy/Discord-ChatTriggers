import { Promise } from "../../PromiseV2"

/**
 * Represents a webhook in Discord.
 */
export class Webhook {
    /**
     * Creates a new Webhook instance.
     * @param {Object} data - The raw data object representing the webhook.
     * @param {Client} client - The Discord bot client associated with the webhook.
     */
    constructor(data, client) {
        /**
         * The unique identifier of the webhook.
         * @type {string}
         */
        this.id = data.id;

        /**
         * The Discord bot client associated with the webhook.
         * @type {Client}
         */
        this.client = client;

        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    send(options) {
        let [body, files] = this.client.payloadCreator.resolveMessage(options);

        return new Promise((resolve, reject) => {
            this.client.send_request(this.url, "POST",
                {
                    body: body,
                    files: files,
                    json: false
                }
            ).then((response) => {
                return resolve(response);
            }).catch(error => {
                console.error(`An error occured while sending message "${body.content}": ${JSON.stringify(error)}`);
                return reject(error);
            });
        });
    }
}

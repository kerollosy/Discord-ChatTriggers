import { USER_AGENT } from './Constants';


/**
 * Represents a payload object used for making API requests.
 */
export class Payload {
    /**
     * Create a Payload object.
     */
    constructor() {
        this.headers = {
            "User-Agent": USER_AGENT
        };
    }

    /**
     * Checks if an Object is a Discord Embed.
     * * NOTE: "title" is a required field for an object to be considered a Discord Embed.
     * @param {Object} embed - The object to check.
     * @returns {Boolean} Whether the object is a Discord Embed.
     */
    isDiscordEmbed(embed) {
        return "title" in embed ? true : false;
    }

    /**
     * Set the bot token for the payload.
     * @param {string} token - The bot token.
     */
    setToken(token) {
        this.headers = {
            'Authorization': 'Bot ' + token,
            "User-Agent": USER_AGENT
        };
    }


    /**
     * Create a request payload.
     * @param {string} url - The URL for the request.
     * @param {string} method - The HTTP method for the request.
     * @param {Object} [body=null] - The body of the request.
     * @param {boolean} [json=true] - Whether the request should be sent as JSON.
     * @param {Object} [headers={}] - Additional headers for the request.
     * @throws {Error} Will throw an error if an argument is of the wrong type.
     * @return {Object} The request payload.
     */
    create(url, method, body = null, json = true, headers = {}) {
        if (typeof url !== 'string' || typeof method !== 'string' || (body && typeof body !== 'object') || typeof json !== 'boolean' || (headers && typeof headers !== 'object')) {
            throw new Error('Invalid argument type');
        }
        return {
            url: url,
            method: method.toUpperCase(),
            headers: {
                ...this.headers,
                ...headers
            },
            body: body,
            json: json
        };
    }

    /**
     * 
     * @param {string|Object} options - The content of the message to be sent.
     * @returns {Object} The resolved payload.
     */
    resolveMessage(options) {
        let body = {}

        if (typeof options == 'string') {
            return { "content": options };
        }

        body["content"] = options.content
        body["tts"] = Boolean(options.tts)
        body["embeds"] = options.embeds?.map(embed => {
            if (this.isDiscordEmbed(embed)) {
                return embed
            }
        })

        return body
    }

    /**
     * Resolves an image to a data URI.
     * @param {string} image - The image to resolve.
     * @returns {string} The resolved image.
     */
    resolveImage(image) {
        if (typeof image == 'string' && image.startsWith("data:")) return image;

        const imageUri = convertToDataURI(image);
        return imageUri;
    }
}
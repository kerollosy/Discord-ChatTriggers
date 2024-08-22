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
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json"
        };
    }

    /**
     * Set the bot token for the payload.
     * @param {string} token - The bot token.
     */
    setToken(token) {
        this.headers = {
            ...this.headers,
            'Authorization': 'Bot ' + token,
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
        body["embeds"] = options.embeds

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
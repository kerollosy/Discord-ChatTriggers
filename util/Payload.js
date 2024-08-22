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
     * @param {Object} [files=null] - Files to be included in the request (for multipart/form-data).
     * @return {Object} The request payload.
     */
    create(url, method, body = null, json = true, headers = {}, files = null) {
        let requestPayload = {
            url: url,
            method: method.toUpperCase(),
            headers: {
                ...this.headers,
                ...headers
            },
            json: json
        }

        if (files) {
            let multipart = {
                ...files,
                payload_json: JSON.stringify(body)
            };

            requestPayload.multipart = multipart;
        } else {
            requestPayload.body = body;
        }

        // print(JSON.stringify(requestPayload))

        return requestPayload
    }

    /**
     * 
     * @param {string|Object} options - The content of the message to be sent.
     * @returns {Object} The resolved payload.
     */
    resolveMessage(options) {
        let body = {}

        if (typeof options == 'string') {
            return [{ "content": options }, null];
        }

        body["content"] = options.content
        body["tts"] = Boolean(options.tts)
        body["embeds"] = options.embeds

        // https://discord.com/developers/docs/reference#uploading-files
        // Each file parameter must be uniquely named in the format files[n]
        // such as files[0], files[1], or files[42]. 
        const files = options.files?.reduce((acc, file, index) => {
            acc[`files[${index}]`] = { "file": file };
            return acc;
        }, {});

        return [body, files]
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
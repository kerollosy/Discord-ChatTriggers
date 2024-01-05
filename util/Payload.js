import { USER_AGENT } from './Constants';


/**
 * Represents a payload object used for making API requests.
 */
export class Payload {
    /**
     * Create a Payload object.
     * @param {string} token - The token to be used for Authorization.
     */
    constructor(token) {
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
    create(url, method, body = null, json=true, headers = {}) {
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
}
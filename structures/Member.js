import Collection from "../util/Collection"
import { User } from "./User"


/**
 * Represents a member in a guild in Discord.
 * @example
 * {
        "user": {
            "username": "sirence11",
            "public_flags": 0,
            "id": "774816281333202944",
            "global_name": "SIRENCE",
            "display_name": "SIRENCE",
            "discriminator": "0",
            "bot": false,
            "avatar_decoration_data": null,
            "avatar": "30c5ae09e6674cf72bb4d95b68399e38"
        },
        "roles": [
            "941907037502193695"
        ],
        "premium_since": null,
        "pending": false,
        "nick": null,
        "mute": false,
        "joined_at": "2023-06-14T20:17:58.213000+00:00",
        "flags": 0,
        "deaf": false,
        "communication_disabled_until": null,
        "avatar": null
    }
 */
export class Member extends User {
    /**
     * Creates a new Member instance.
     * @param {Object} data - The raw data object representing the member.
     * @param {Object} client - The Discord bot client associated with the member.
     */
    constructor(data, client) {
        super(data.user, client)
        this.client = client
    }
}
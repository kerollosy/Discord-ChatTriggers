import Collection from "../util/Collection"
import { Role } from "./Role"
import { Member } from "./Member"
import { Channel } from "./Channel"
import { User } from "./User"

/**
 * Represents a guild (server) in Discord.
 */
export class Guild {
    /**
     * Creates a new Guild instance.
     * @param {Object} data - The raw data object representing the guild.
     * @param {Object} client - The Discord bot client associated with the guild.
     */
    constructor(data, client) {
        /**
         * The Discord bot client associated with the client.
         * @type {Client}
         */
        this.client = client

        /**
         * The ID of the guild.
         * @type {string}
         */
        this.id = data.id

        /**
         * The icon of the guild.
         * @type {string}
         */
        this.icon = data.icon

        /**
         * The name of the guild.
         * @type {string}
         */
        this.name = data.name

        /**
         * The ID of the owner of the guild.
         * @type {string}
         */
        this.owner_id = data.owner_id

        /**
         * Collection of members in the guild.
         * @type {Collection<Member>}
         */
        this.members = new Collection()

        /**
         * Collection of channels in the guild.
         * @type {Collection<Channel>}
         */
        this.channels = new Collection()

        /**
         * Collection of roles in the guild.
         * @type {Collection<Role>}
         */
        this.roles = new Collection()

        data.roles.forEach(role => {
            this.roles.set(role.id, new Role(role, this.client))
        });

        data.members.forEach(member => {
            this.members.set(member.user.id, new Member(member, this.client))
            this.client.users.set(member.user.id, new User(member.user, this.client))
        });

        data.channels.forEach(channel => {
            this.channels.set(channel.id, new Channel(channel, this.client))
            this.client.channels.set(channel.id, new Channel(channel, this.client))
        })

        // Copy additional properties from data to the guild object.
        for (let key in data) {
            if (!this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}
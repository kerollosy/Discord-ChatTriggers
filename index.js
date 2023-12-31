import { Client } from "./Client";
import { TOKEN } from './config'


let client = new Client();

client.login(TOKEN);

client.on("message", (message) => {
    if (message.author.bot) return
    // console.log(message)
    console.log("A new message was created:", message.content);
    if (message.content === '!ping') {
        // Send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    } else if (message.content === `!server`) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.member_count}`);
    } else if (message.content === `!user-info`) {
        message.reply(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    } else if (message.content.startsWith(`!avatar`)) {
        if (message.mentions.length === 0) {
            message.reply(message.author.username + "'s avatar: " + message.author.avatarURL);
            return;
        }
        message.reply(message.mentions[0].username + "'s avatar: " + message.mentions[0].avatarURL);
    }
});

client.on("ready", (user) => {
    console.log("The client is ready. User:", user.username);
});
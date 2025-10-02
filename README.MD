<div align="center">
    <a href="https://www.chattriggers.com/modules/v/discord"><img src="https://i.imgur.com/a6v1uUd.png" width="200" alt="discord.js" /></a>
</div>


## Table of Contents
- [Installing the Module](#installing-the-module)
   - [ChatTriggers Import Method](#chattriggers-import-method) [Recommneded]
   - [Manual Method](#manual-method)
- [Creating a Discord Bot](#creating-a-discord-bot)
- [Intents](#enabling-privileged-intents) [IMPORTANT]
- [Example Usage](#example-usage)
- [Help](#help)

## Installing the Module

### ChatTriggers Import Method: 

Before you can use this module, you need to install the ChatTriggers mod and place it in your Minecraft mods folder. Here's how to do it:

1. Download the ChatTriggers mod from the [official website](https://chattriggers.com/).
2. Place the downloaded `.jar` file in your Minecraft mods folder.
3. Launch Minecraft and join a world or server.
4. Run the command `/ct import discord` in the chat to import the module.

### Manual Method

1. Download the latest release of the module from the repository
2. Extract the downloaded file.
3. Run the command `/ct files`
4. Open the modules folder
5. Place the extracted files in the folder
6. Run the command `/ct reload`

## Creating a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click on "New Application".
2. Give your application a name and click "Create".
3. Click on the "Bot" tab on the left side of the screen and then click "Add Bot".
4. Under the "Token" section, click "Copy" to copy your bot's token. This token is used to log in to your bot.

## Enabling Privileged Intents

1. In the Discord Developer Portal, click on your application.
2. Click on the "Bot" tab on the left side of the screen.
3. Under the "Privileged Gateway Intents" section, toggle on "SERVER MEMBERS INTENT" and "MESSAGE CONTENT INTENT".

## Generating Bitwise Intents

Bitwise intents represent the events your bot can listen to. You can calculate the bitwise value of your intents using the [Discord Intents Calculator](https://discord-intents-calculator.vercel.app/). 

## Using Intents in the Client

You can use the bitwise intents value when creating a new instance of the `Client` class. Here's an example:

```javascript
const client = new Client({
    token: 'your-bot-token',
    intents: 1512 // replace with your bitwise intents value
});
```

To log in to your bot, call the `login` method on the `Client` instance:

```javascript
client.login().then(() => {
    console.log('Bot is now connected!');
}).catch(console.error);
```

Remember to replace `'your-bot-token'` with your bot's actual token.

## Example Usage
```js
import DiscordClient from "../discord";
const client = new DiscordClient({
    intents: 3276799
});

client.on("ready", (user) => {
    console.log(`Logged in as ${user.username}!`);
});

client.on("message", (message) => {
    if (message.content === '!ping') {
        message.reply("pong");
    }
});

client.login("token");
```

## Help
If you are experiencing any problems or you just can't get started with the module, don't hesitate to dm me on discord: kerollosy

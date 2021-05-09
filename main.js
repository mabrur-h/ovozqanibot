require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const COMMANDS = require('./message/commands');

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.on('message', async (message) => {

    await COMMANDS(message, bot)

})



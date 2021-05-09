require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const COMMANDS = require('./message/commands');
const QUERIES = require('./inline/query');

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.on('message', async (message) => {
    await COMMANDS(message, bot)
})


bot.on('inline_query', async (query) => {
    await QUERIES(query, bot)
})



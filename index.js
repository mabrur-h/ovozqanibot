import TelegramBot from 'node-telegram-bot-api'
import config from "./config.js";
import postgres from "./modules/pg.js";
import Commands from "./commands/index.js"

const TOKEN = config.TOKEN

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.on('message', async (message) => {
    try {
        let db = await postgres()

        await Commands.botStart(bot, db, message)
        await Commands.botRandom(bot, db, message)
        await Commands.newVoice(bot, db, message)
        await Commands.newAdmin(bot, db, message)
        await Commands.getAudios(bot, db, message)
        await Commands.changeSettings(bot, db, message)

    } catch (e) {
        console.log(e)
    }
})

bot.on('inline_query', async (query) => {
    try {
        let db = await postgres()

        await Commands.searchVoices(bot, db, query)

    } catch (e) {
        console.log(e)
    }
})
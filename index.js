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
        console.log(message)
        let user = await db.users.findOne({
            where: {
                user_id: `${message.chat.id}`
            },
            raw: true
        })

        await Commands.botStart(bot, db, message, config)
        await Commands.botRandom(bot, db, message)
        await Commands.newVoice(bot, db, message, user)
        await Commands.newAdmin(bot, db, message, user)
        await Commands.getAudios(bot, db, message, user)
        await Commands.changeSettings(bot, db, message, user)
        await Commands.adsController(bot, db, message, user)
        await Commands.editVoiceController(bot, db, message, user)
        await Commands.mailingController(bot, db, message, config, user)

    } catch (e) {
        console.log(e)
    }
})

bot.on('inline_query', async (query) => {
    try {
        let db = await postgres()

        await Commands.InlineUserController(bot, db, query)
        await Commands.searchVoices(bot, db, query)

    } catch (e) {
        console.log(e)
    }
})

bot.on('callback_query', async (query) => {
    try {
        let db = await postgres()

        let user = await db.users.findOne({
            where: {
                user_id: `${query.message.chat.id}`
            },
            raw: true
        })

        await Commands.callbackQueryController(bot, db, query, user)

    } catch (e) {
        console.log(e)
    }
})

bot.on('chosen_inline_result', async (result) => {
    try {
        let db = await postgres()

        await Commands.chosenInlineController(bot, db, result)
    } catch (e) {
        console.log(e)
    }
})
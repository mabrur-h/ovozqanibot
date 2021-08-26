import Command from "./commands.js";

export default class Commands {
    static async botStart(bot, db, message) {
        if ((message.text === '/start' || message.text === '⬅️Ortga') && message.chat.type === 'private') {
            await Command.onStart(bot, db, message)
        }
    }

    static async botRandom(bot, db, message) {
        if (message.text === '/random') {
            await Command.randomVoice(bot, db, message)
        }
    }

    static async newVoice(bot, db, message) {
        if (message.chat.type === 'private') await Command.addVoice(bot, db, message)
    }

    static async newAdmin(bot, db, message, user) {
        if (message.chat.type === 'private') await Command.addAdmins(bot, db, message, user)
    }

    static async getAudios(bot, db, message) {
        if (message.chat.type === 'private') await Command.getVoices(bot, db, message)
    }

    static async changeSettings(bot, db, message, user) {
        if (message.chat.type === 'private') await Command.manageSettings(bot, db, message, user)
    }

    static async searchVoices(bot, db, query) {
        await Command.getInlineResult(bot, db, query)
    }

    static async adsController(bot, db, message, user) {
        if (message.chat.type === 'private' && message.text === '🧾 Inline reklama' && user.role === 'admin') {
            await Command.manageInlineAds(bot, db, message, user)
            await db.users.update({
                step: 5
            }, {
                where: {
                    user_id: `${message.chat.id}`
                }
            })
            await bot.sendMessage(message.chat.id, `Inline reklama uchun sarlavha yuboring.`)
        }
        if (message.chat.type === 'private' && message.text === '🧾 Start reklama' && user.role === 'admin') {
            await Command.manageStartAds(bot, db, message, user)
        }
    }
}
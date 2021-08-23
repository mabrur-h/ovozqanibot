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

    static async newAdmin(bot, db, message) {
        if (message.chat.type === 'private') await Command.addAdmins(bot, db, message)
    }

    static async getAudios(bot, db, message) {
        if (message.chat.type === 'private') await Command.getVoices(bot, db, message)
    }

    static async changeSettings(bot, db, message) {
        if (message.chat.type === 'private') await Command.manageSettings(bot, db, message)
    }

    static async searchVoices(bot, db, query) {
        await Command.getInlineResult(bot, db, query)
    }
}
import Command from "./commands.js";

export default class Commands {
    static async botStart(bot, db, message) {
        if (message.text === '/start' && message.chat.type === 'private') {
            await Command.onStart(bot, db, message)
        }
    }
    static async botRandom(bot, db, message) {
        if (message.text === '/random') {
            await Command.randomVoice(bot, db, message)
        }
    }

    static async newVoice(bot, db, message) {
        await Command.addVoice(bot, db, message)
    }

    static async newAdmin(bot, db, message) {
        await Command.addAdmins(bot, db, message)
    }

    static async getAudios(bot, db, message) {
        await Command.getVoices(bot, db, message)
    }


}
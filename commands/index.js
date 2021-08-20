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
        if (message.text === "ovoz" && message.chat.type === 'private') {
            await Command.addVoice(bot, db, message)
        }
    }
}
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

    static async newVoice(bot, db, message, user) {
        if (message.chat.type === 'private') await Command.addVoice(bot, db, message, user)
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
        if (message.chat.type === 'private' && user?.role === 'admin') {
            await Command.manageInlineAds(bot, db, message, user)
        }
        if (message.chat.type === 'private' && message.text === '🧾 Start reklama' && user.role === 'admin') {
            await Command.manageStartAds(bot, db, message, user)
        }
    }

    static async callbackQueryController (bot, db, query) {
        if (query?.data === 'deleteInlineAds') {
            try {
                await db.inline_ads.destroy({
                    where: {},
                    truncate: true
                })

                await bot.sendMessage(query.message.chat.id, `Barcha reklamalar o'chirildi!`)
            } catch (e) {
                console.log()
            }
        } else if (query?.data === 'activateAds') {
            try {
                await db.inline_ads.update({
                    isActive: true
                }, {
                    where: {
                        uuid: `8b5e9bd7-74f3-4276-89b6-6c1615c666ba`
                    }
                })
                await bot.sendMessage(query.message.chat.id, `Aktivlashtirildi!`)
            } catch (e) {
                console.log(e)
            }
        } else if (query?.data === 'deleteLastAds') {
            try {
                let ads = await db.inline_ads.findOne({
                    order: [ [ 'createdAt', 'DESC' ]],
                    raw: true
                })

                await db.inline_ads.destroy({
                    where: {
                        uuid: ads.uuid
                    }
                })

                await bot.sendMessage(query.message.chat.id, `So'ngi reklama o'chirildi!`)
            } catch (e) {
                console.log(e)
            }
        }
    }
}
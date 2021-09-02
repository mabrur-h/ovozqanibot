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

    static async getAudios(bot, db, message, user) {
        if (message.chat.type === 'private') await Command.getVoices(bot, db, message, user)
    }

    static async changeSettings(bot, db, message, user) {
        if (message.chat.type === 'private') await Command.manageSettings(bot, db, message, user)
    }

    static async searchVoices(bot, db, query) {
        await Command.getInlineResult(bot, db, query)
    }

    static async InlineUserController(bot, db, query) {
        await Command.addInlineUser(bot, db, query)
        await Command.countInlineQuery(bot, db, query)
    }

    static async adsController(bot, db, message, user) {
        if (message.chat.type === 'private' && user?.role === 'admin') {
            await Command.manageInlineAds(bot, db, message, user)
        }
        if (message.chat.type === 'private' && message.text === '🧾 Start reklama' && user.role === 'admin') {
            await Command.manageStartAds(bot, db, message, user)
        }
    }

    static async callbackQueryController (bot, db, query, user) {
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
                console.log(query)

                await db.inline_ads.update({
                    isActive: true
                }, {
                    where: {
                        uuid: query.message.text.split("#id: ")[query.message.text.split("#id: ").length - 1]
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
        } else if (query?.data === 'change_voice') {
            try {
                await db.users.update({
                    step: 10,
                    activeID: query.message.voice.file_unique_id
                }, {
                    where: {
                        user_id: `${user.user_id}`
                    }
                })

                let keyboard = [["⬅️Ortga"]]

                await bot.sendMessage(query.message.chat.id, `Ovozli xabarni o'zgartirishga o'tdingiz! Yangi audioni tashlang`, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard
                    }
                })

            } catch (e) {
                console.log(e)
            }
        } else if (query.data === 'change_name') {
            try {
                await db.users.update({
                    step: 11,
                    activeID: query.message.voice.file_unique_id
                }, {
                    where: {
                        user_id: `${user.user_id}`
                    }
                })

                let keyboard = [["⬅️Ortga"]]

                await bot.sendMessage(query.message.chat.id, `Ovozli xabar nomini o'zgartirishga o'tdingiz! Yangi nomni yozing`, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard
                    }
                })

            } catch (e) {
                console.log(e)
            }
        } else if (query?.data === 'change_voice') {
            try {
                await db.users.update({
                    step: 10,
                    activeID: query.message.voice.file_unique_id
                }, {
                    where: {
                        user_id: `${user.user_id}`
                    }
                })

                let keyboard = [["⬅️Ortga"]]

                await bot.sendMessage(query.message.chat.id, `Ovozli xabarni o'zgartirishga o'tdingiz! Yangi audioni tashlang`, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard
                    }
                })

            } catch (e) {
                console.log(e)
            }
        } else if (query.data === 'change_tags') {
            try {
                await db.users.update({
                    step: 12,
                    activeID: query.message.voice.file_unique_id
                }, {
                    where: {
                        user_id: `${user.user_id}`
                    }
                })

                let keyboard = [["⬅️Ortga"]]

                await bot.sendMessage(query.message.chat.id, `Ovozli xabar teglarini o'zgartirishga o'tdingiz! Yangi teglarni yozing`, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard
                    }
                })

            } catch (e) {
                console.log(e)
            }
        } else if (query.data === 'off_voice') {
            try {
                await db.audios.update({
                    isActive: false
                }, {
                    where: {
                        file_unique_id: query.message.voice.file_unique_id
                    }
                })

                await bot.sendMessage(query.message.chat.id, 'Ovoz ochirildi')
            } catch (e) {
                console.log(e)
            }
        }
    }

    static async editVoiceController (bot, db, message, user) {
        try {
            await Command.editVoice(bot, db, message, user)
        } catch (e) {
            console.log(e)
        }
    }

    static async chosenInlineController (bot, db, result) {
        try {
            await Command.countInlineResult(bot, db, result)
        } catch (e) {
            console.log(e)
        }
    }

}
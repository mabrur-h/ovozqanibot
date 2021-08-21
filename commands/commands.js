export default class Commands {

    static async onStart(bot, db, message) {
        try {
            let findUser = await db.users.findOne({
                where: {
                    user_id: `${message.from.id}`
                }
            })
            if (findUser) {
                await db.users.update({
                    step: 1
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })
                await bot.sendMessage(message.chat.id, 'user found')
            } else {
                let user = await db.users.create({
                    user_id: message.from.id,
                    name: message.from.first_name,
                    username: message.from.username,
                    step: 1
                })
                await bot.sendMessage(message.chat.id, `successfully registered`)
            }
            let keyboard = [["Top audiolar"]]

            await bot.sendMessage(message.chat.id, `Канал - https://t.me/joinchat/UEOeiBLpY5xmNGQy`)
            await bot.sendMessage(message.chat.id, `Если ты хочешь начать пользоваться ботом, нажми на кнопку`, {
                parse_mode: "HTML",
                reply_markup: {
                    resize_keyboard: true,
                    keyboard
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    static async randomVoice(bot, db, message) {
        try {
            let file = await bot.getFile("AwACAgQAAxkBAAIwn2EgMwrZiMGP5xQvU1S2PzV953jvAAJiGgACwoJwUHCRSEZmgqEVIAQ")
            await bot.sendVoice(message.chat.id, file.file_id)
        } catch (e) {
            console.log(e)
        }
    }

    static async addVoice(bot, db, message) {
        try {
            let DATA = {}
            if (message.text === 'ovoz' && message.chat.type === 'private') {

                await bot.sendMessage(message.chat.id, 'Audio jonating')
                await db.users.update({
                    step: 2
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })
            }

            let user = await db.users.findOne({
                where: {
                    user_id: `${message.from.id}`
                },
                raw: true
            })

            if (user.step === 2 && message.voice) {
                let findVoice = await db.audios.findOne({
                    where: {
                        file_id: message.voice.file_id
                    }
                })
                if (!findVoice) {

                    await db.users.update({
                        step: 3
                    }, {
                        where: {
                            user_id: `${message.from.id}`
                        }
                    })
                    await bot.sendMessage(message.chat.id, "Ovoz nomini yozing")
                } else {
                    await bot.sendMessage(message.chat.id, "Bu ovoz oldin qo'shilgan")
                    await db.users.update({
                        step: 1
                    }, {
                        where: {
                            user_id: `${message.from.id}`
                        }
                    })
                    await bot.sendMessage(message.chat.id, "1-stepga qaytdi.")
                }
            }

            if (user.step === 3 && message.text) {
                DATA.name = message.text

                await db.users.update({
                    step: 4
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })
                await bot.sendMessage(message.chat.id, "Ovoz teglarini yozing")
            }

            if (user.step === 4 && message.text) {
                DATA.tags = message.text.split(" ")

                await db.users.update({
                    step: 1
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })

                let voice = await db.audios.create({
                    file_id: DATA.file_id,
                    name: DATA.name,
                    tags: DATA.tags
                })

                console.log(voice)


                await bot.sendMessage(message.chat.id, "Ovoz qo'shildi")
            }
            console.log(DATA)
        } catch (e) {
            console.log(e)
        }
    }

}
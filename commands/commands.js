import pkg from 'sequelize';
const { Op } = pkg

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

            let keyboard
            if (findUser.dataValues.role === 'admin') {
                keyboard = [["Top audiolar"], ["Ovoz qo'shish", "Haftalik statistika"], ["Kunlik statistika", "Oylik statistika"], ["Sozlamalar"]]
            } else if (findUser.dataValues.role === 'user') {
                keyboard = [["Top audiolar"], ["Ovoz qo'shish", "Biz haqimizda"]]
            }


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
            let audiosCount = await db.audios.count()

            function getRandomInt(min, max) {
                min = Math.ceil(min)
                max = Math.floor(max)
                return Math.floor(Math.random() * (max - min)) + min
            }

            let randomNumber = getRandomInt(1, audiosCount + 1)
            console.log(randomNumber)
            let randomVoice = await db.audios.findOne({
                where: {
                    id: randomNumber
                },
                raw: true
            })

            let keyboard = [
                [
                    {
                        text: "Ulashish 🔁",
                        switch_inline_query: "text"
                    }
                ]
            ]

            let file = await bot.getFile(randomVoice.file_id)

            await bot.sendVoice(message.chat.id, file.file_id, {
                caption: `<b>Nomi:</b> ${randomVoice.name}\n<b>Teglar:</b> ${randomVoice.tags.join(', ')}\n<b>Ishlatilgan:</b> 1 marta`,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    static async addVoice(bot, db, message) {
        try {
            let DATA = {}
            if (message.text === '/ovoz' && message.chat.type === 'private') {

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
                DATA.file_id = message.voice.file_id

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
                    file_id: "AwACAgQAAxkBAAIyRWEg96945NN8ic3Q9lHbxXwZ7ShhAAJ2AgACj0wcUN7_NNzceStLIAQ",
                    name: "akang kuchaydi",
                    tags: ["akang", "kuchaydi"]
                })

                await bot.sendMessage(message.chat.id, "Ovoz qo'shildi")
            }
            console.log(DATA)
        } catch (e) {
            console.log(e)
        }
    }

    static async addAdmins(bot, db, message) {
        try {
            let user = await db.users.findOne({
                where: {
                    user_id: `${message.chat.id}`
                },
                raw: true
            })

            console.log(user)

            let firstWord = message.text.replace(/ .*/, "");
            let nextWord = message.text.replace(/^\S+\s+/, "");

            if (Number(nextWord) !== Number(message.from.id)) {
                if (firstWord === '/newmoderator' && user.role === 'admin') {
                    let user = await db.users.findOne({
                        where: {
                            user_id: nextWord
                        },
                        raw: true
                    })

                    if (user) {

                        await db.users.update({
                            role: "moderator"
                        }, {
                            where: {
                                user_id: nextWord
                            }
                        })
                        let text = user.username ? `@${user.username} moderatorlikka tayinlandi` : `${user.name} moderatorlikka tayinlandi`

                        await bot.sendMessage(message.chat.id, text)
                        await bot.sendMessage(Number(nextWord), 'Endi siz moderatorsiz')
                    } else {
                        await bot.sendMessage(message.chat.id, 'Bunday foydalanuvchi topilmadi!')
                    }


                } else if (firstWord === '/newadmin' && user.role === 'admin') {
                    let user = await db.users.findOne({
                        where: {
                            user_id: nextWord
                        },
                        raw: true
                    })

                    if (user) {
                        await db.users.update({
                            role: 'admin'
                        }, {
                            where: {
                                user_id: nextWord
                            }
                        })

                        let text = user.username ? `@${user.username} adminlikka tayinlandi` : `${user.name} adminlikka tayinlandi`

                        await bot.sendMessage(message.chat.id, text)
                        await bot.sendMessage(Number(nextWord), 'Endi siz adminsiz')
                    } else {
                        await bot.sendMessage(message.chat.id, 'Bunday foydalanuvchi topilmadi!')
                    }
                } else if (firstWord === '/removeadmin' && user.role === 'admin') {
                    let user = await db.users.findOne({
                        where: {
                            user_id: nextWord
                        },
                        raw: true
                    })

                    if (user) {
                        await db.users.update({
                            role: 'user'
                        }, {
                            where: {
                                user_id: nextWord
                            }
                        })

                        let text = user.username ? `@${user.username} endi oddiy foydalanuvchi` : `${user.name} endi oddiy foydalanuvchi`

                        await bot.sendMessage(message.chat.id, text)
                        await bot.sendMessage(Number(nextWord), 'Endi siz oddiy foydalanuvchisiz')
                    }
                }
            } else {
                await bot.sendMessage(message.chat.id, "O'zingizni o'zgartira olmaysiz!")
            }

            if (firstWord === '/getadmins' && user.role === 'admin') {
                let admins = await db.users.findAll({
                    where: {
                        [Op.or]: [
                            { role: 'admin' },
                            { role: 'moderator' }
                        ]
                    },
                    raw: true
                })

                console.log(admins)

                let text = admins.map(admin => (`${admin.name} (${admin.role})\n`));

                await bot.sendMessage(message.chat.id, text.join(''))
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async getVoices(bot, db, message) {
        try {
            if (message.text.toLowerCase() === 'barcha ovozlar') {
                await bot.sendMessage(message.chat.id, 'barcha ovozlar')
            }
        } catch (e) {
            console.log(e)
        }
    }

}
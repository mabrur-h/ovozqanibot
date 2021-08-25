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
            if (findUser.dataValues?.role === 'admin') {
                keyboard = [["🎶 Barcha ovozlar"], ["➕ Ovoz qo'shish", "7️⃣ Haftalik statistika"], ["1️⃣ Kunlik statistika", "🔢 Oylik statistika"], ["⚙️Sozlamalar", "💲Reklama"]]
            } else if (findUser.dataValues.role === 'user') {
                keyboard = [["🎶 Barcha ovozlar"], ["💲Reklama", "ℹ ️Biz haqimizda"], ["➕ Ovoz qo'shish"]]
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
            let getUser = await db.users.findOne({
                where: {
                    user_id: `${message.chat.id}`
                },
                raw: true
            })

            if (message.text === "➕ Ovoz qo'shish" && message.chat.type === 'private' && (getUser.role === 'admin' || getUser.role === 'moderator')) {
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
                    file_id: "AwACAgIAAxkBAAIzhWEhg9Smj0FMwM7gJoKx2-YgntZnAAIuDwACUgUBSVFlzQ2UbD_QIAQ",
                    name: "bir ikki uch",
                    tags: ["bir", "ikki"]
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

            let firstWord = '', nextWord = ''

            if (message.text) {
                firstWord = message.text.replace(/ .*/, "");
                nextWord = message.text.replace(/^\S+\s+/, "");
            }
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

            if (firstWord === 'Adminlar' && user.role === 'admin') {
                let admins = await db.users.findAll({
                    where: {
                        [Op.or]: [
                            { role: 'admin' },
                            { role: 'moderator' }
                        ]
                    },
                    raw: true
                })

                let text = admins.map(admin => (`<b>${admin.name}</b> (${admin.role}) - ${admin.user_id}\n`));

                await bot.sendMessage(message.chat.id, text.join(''), {
                    parse_mode: "HTML"
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async getVoices(bot, db, message) {
        try {
            if (message.text === '🎶 Barcha ovozlar') {
                let voices = await db.audios.findAll({raw: true})
                let text = voices.map(voice => (`/${voice.id}. ${voice.name} - (12)\n`));
                await bot.sendMessage(message.chat.id, text.join(''), {
                    parse_mode: "HTML"
                })
            }

            let messageNum = parseInt(message.text.replace(/\\|\//g,''))
            let isContainsSlash = (message?.text.split(/(?!$)/u))[0] === '/'

            let voicesCount = await db.audios.count()
            if (messageNum > voicesCount) {
                await bot.sendMessage(message.chat.id, `Bunday ovoz topilmadi!`)
            } else if (typeof messageNum === 'number' && !isNaN(messageNum) && isContainsSlash) {
                await bot.sendMessage(message.chat.id, 'ovoz keladi')
                let voice = await db.audios.findOne({
                    where: {
                        id: messageNum
                    },
                    raw: true
                })

                let keyboard = [
                    [
                        {
                            text: "Ulashish 🔁",
                            switch_inline_query: `${voice.name}`
                        }
                    ]
                ]

                await bot.sendVoice(message.chat.id, voice.file_id, {
                    caption: `<b>Nomi:</b> ${voice.name}\n<b>Teglar:</b> ${voice.tags.join(', ')}\n<b>Ishlatilgan:</b> 1 marta`,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                })

            }

        } catch (e) {
            console.log(e)
        }
    }

    static async manageSettings(bot, db, message) {
        try {
            let user = await db.users.findOne({
                where: {
                    user_id: `${message.chat.id}`
                },
                raw: true
            })

            if (message.text === '⚙️Sozlamalar' && user.role === 'admin') {
                let keyboard = [["Adminlar", "Adminlikdan olish"], ["Admin tayinlash", "Moderator tayinlash"], ["⬅️Ortga"]]
                await bot.sendMessage(message.chat.id, 'sozlamalar ochildi', {
                    parse_mode: "HTML",
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard
                    }
                })
            }

            if (message.text === 'Adminlikdan olish' && user.role === 'admin') {
                await bot.sendMessage(message.chat.id, `Foydalanuvchini adminstratorlar qatoridan chiqarish uchun\n/removeadmin <code>user_id</code>\nbuyrug'idan foydalaning.\nMisol uchun:\n/removeadmin 1234567890`, {
                    parse_mode: "HTML"
                })
            } else if (message.text === 'Admin tayinlash' && user.role === 'admin') {
                await bot.sendMessage(message.chat.id, `Admin tayinlash uchun\n/newadmin <code>user_id</code>\nbuyrug'idan foydalaning.\nMisol uchun:\n/newadmin 1234567890`, {
                    parse_mode: "HTML"
                })
            } else if (message.text === 'Moderator tayinlash' && user.role === 'admin') {
                await bot.sendMessage(message.chat.id, `Moderator tayinlash uchun\n/newmoderator <code>user_id</code>\nbuyrug'idan foydalaning.\nMisol uchun:\n/newmoderator 1234567890`, {
                    parse_mode: "HTML"
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async manageAds(bot, db, message) {
        try {

        } catch (e) {
            console.log(e)
        }
    }

    static async getInlineResult(bot, db, query) {
        try {
            let results = []
            let voices

            results.push({
                type: 'article',
                id: 'location',
                title: '@mabrur_dev',
                thumb_url: "https://telegra.ph/file/8246dc63fd15e6f8776fc.jpg",
                description: '💻 Dasturlashga va muallifning hayotiga oid blog',
                input_message_content: {
                    message_text: 'Change Location\n@ovozqanirobot ',
                    parse_mode: "HTML"
                },
                reply_markup: {
                    "inline_keyboard": [
                        [{
                            "text": "InlineFeatures.",
                            "url": "https://www.fcb.uz"
                        }],
                        [{
                            "text": "OtherFeatures.",
                            "url": "https://www.fcb.uz"
                        }]
                    ]
                }
            })

            voices = await db.audios.findAndCountAll({
                raw: true
            })


            if (query?.query) {
                voices = await db.audios.findAndCountAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${query.query}%`
                        }
                    },
                    raw: true
                })
            }

            for (let voice of voices.rows) {
                results.push({
                    type: 'voice',
                    id: voice.id,
                    voice_file_id: voice.file_id,
                    title: voice.name,
                    caption_entities: {
                        offset: 2
                    }
                })
            }

            if (voices.count === 0) {
                await bot.answerInlineQuery(query.id, results, {
                    cache_time: 0,
                    is_personal: true,
                    switch_pm_text: "Ovoz taklif qilish",
                    switch_pm_parameter: "convert"
                })
            } else {
                await bot.answerInlineQuery(query.id, results, {
                    cache_time: 0
                })
            }

        } catch (e) {
            console.log(e)
        }
    }

}
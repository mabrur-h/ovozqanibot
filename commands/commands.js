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
            if (findUser?.dataValues?.role === 'admin') {
                keyboard = [["🎶 Barcha ovozlar"], ["➕ Ovoz qo'shish", "7️⃣ Haftalik statistika"], ["1️⃣ Kunlik statistika", "🔢 Oylik statistika"], ["⚙️Sozlamalar", "💲Reklama"]]
            } else if (findUser.dataValues?.role === 'user') {
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

    static async addVoice(bot, db, message, user) {
        try {

            if (message.text === "➕ Ovoz qo'shish" && message.chat.type === 'private' && (user.role === 'admin' || user.role === 'moderator')) {
                await bot.sendMessage(message.chat.id, 'Audio jonating')
                await db.users.update({
                    step: 2
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })
            }

            if (user?.step === 2 && message.voice) {

                let findVoice = await db.audios.findOne({
                    where: {
                        file_unique_id: message.voice.file_unique_id
                    }
                })

                if (!findVoice) {
                    await db.users.update({
                        step: 3,
                        activeID: message.voice.file_unique_id
                    }, {
                        where: {
                            user_id: `${message.from.id}`
                        }
                    })

                    await db.audios.create({
                        file_id: message.voice.file_id,
                        file_unique_id: message.voice.file_unique_id,
                        name: 'ovozqani',
                        tags: ['ovozqani']
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

            if (user?.step === 3 && message.text) {

                await db.audios.update({
                    name: message.text
                }, {
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                await db.users.update({
                    step: 4
                }, {
                    where: {
                        user_id: user.user_id
                    }
                })
                await bot.sendMessage(message.chat.id, "Ovoz teglarini yozing")
            }

            if (user?.step === 4 && message.text) {

                await db.audios.update({
                    tags: message.text.split(" ")
                }, {
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                await db.users.update({
                    step: 1,
                    activeID: null
                }, {
                    where: {
                        user_id: `${message.from.id}`
                    }
                })

                await bot.sendMessage(message.chat.id, "Ovoz qo'shildi")
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async addAdmins(bot, db, message, user) {
        try {
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

    static async getVoices(bot, db, message, user) {
        try {
            if (message.text === '🎶 Barcha ovozlar') {
                let voices = await db.audios.findAll({
                    raw: true,
                    include: {
                        model: db.voice_counts
                    },
                    order: [["id", "ASC"]]
                })
                let text = voices.map(voice => (`/${voice.id}. ${voice.name} (${voice['voice_count.count']}) \n`));
                await bot.sendMessage(message.chat.id, text.join(''), {
                    parse_mode: "HTML"
                })
            }

            let messageNum, isContainsSlash

            if (message?.text) {
                messageNum = parseInt(message?.text?.replace(/\\|\//g,''))
                isContainsSlash = (message?.text?.split(/(?!$)/u))[0] === '/'
            }

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

                await db.voice_counts.increment({
                    count: 1
                }, {
                    where: {
                        voice_id: voice.uuid
                    }
                })

                let keyboard

                if (user.role === 'admin' || user.role === 'moderator') {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice.name}`
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'zgartirish",
                                callback_data: "change_voice"
                            }
                        ],
                        [
                            {
                                text: "Nomni o'zgartirish",
                                callback_data: "change_name"
                            },
                            {
                                text: "Teglarni o'zgartirish",
                                callback_data: "change_tags"
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'chirish",
                                callback_data: "off_voice"
                            }
                        ]
                    ]
                } else {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice.name}`
                            }
                        ]
                    ]
                }

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
            await bot.sendMessage(message.chat.id, `Ovozlar topilmadi!`)
        }
    }

    static async manageSettings(bot, db, message, user) {
        try {
            if (message.text === '⚙️Sozlamalar' && user.role === 'admin') {
                let keyboard = [["Adminlar", "Adminlikdan olish"], ["Admin tayinlash", "Moderator tayinlash"], ["🧾 Inline reklama", "🧾 Start reklama"], ["⬅️Ortga"]]
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

    static async manageInlineAds(bot, db, message, user) {
        try {
            if (message.text === '🧾 Inline reklama') {
                await db.users.update({
                    step: 5
                }, {
                    where: {
                        user_id: `${message.chat.id}`
                    }
                })
                await bot.sendMessage(message.chat.id, `Inline reklama uchun sarlavha yuboring.`)
            }
            let inlineAds
            if (user.step === 5) {
                if (message.text) {
                    inlineAds = await db.inline_ads.create({
                        title: message.text
                    })

                    await db.users.update({
                        step: 6,
                        activeID: inlineAds.uuid
                    }, {
                        where: {
                            user_id: user.user_id
                        }
                    })
                    await bot.sendMessage(message.chat.id, `Rasm URLini yuboring!`)
                } else {
                    await bot.sendMessage(message.chat.id, `Matn formatida yuboring!`)
                }
            } else if (user.step === 6) {
                if (message.text) {
                    await db.inline_ads.update({
                        thumb_url: message?.text
                    }, {
                        where: {
                            uuid: user.activeID
                        }
                    })

                    await db.users.update({
                        step: 7
                    }, {
                        where: {
                            user_id: `${user.user_id}`
                        }
                    })
                    await bot.sendMessage(message.chat.id, `Description yuboring!`)
                } else {
                    await bot.sendMessage(message.chat.id, `Matn ko'rinishida yuboring!`)
                }
            } else if (user.step === 7) {
                if (message.text) {
                    await db.inline_ads.update({
                        description: message.text
                    }, {
                        where: {
                            uuid: user.activeID
                        }
                    })
                    await db.users.update({
                        step: 8
                    }, {
                        where: {
                            user_id: `${user.user_id}`
                        }
                    })
                    await bot.sendMessage(message.chat.id, `Bosilganda chiqadigan mattni yuboring!`)
                } else {
                    await bot.sendMessage(message.chat.id, `Matn ko'rinishida yuboring!`)
                }
            } else if (user.step === 8) {
                if (message.text) {
                    await db.inline_ads.update({
                        message_text: message.text
                    }, {
                        where: {
                            uuid: user.activeID
                        }
                    })
                    await db.users.update({
                        step: 9
                    }, {
                        where: {
                            user_id: `${user.user_id}`
                        }
                    })
                    await bot.sendMessage(message.chat.id, `Xabar tagidagi knopkalarni yuboring!`)
                } else {
                    await bot.sendMessage(message.chat.id, `Matn ko'rinishida yuboring!`)
                }
            } else if (user.step === 9) {
                if (message.text) {
                    await db.inline_ads.update({
                        keyboard: [message.text]
                    }, {
                        where: {
                            uuid: user.activeID
                        }
                    })

                    let inlineAd = await db.inline_ads.findOne({
                        where: {
                            uuid: user.activeID
                        },
                        raw: true
                    })

                    await db.users.update({
                        step: 1,
                        activeID: null
                    }, {
                        where: {
                            user_id: `${user.user_id}`
                        }
                    })
                    let keyboard = [
                        [
                            {
                                text: "Aktivlashtirish ✅",
                                callback_data: `activateAds`
                            },
                            {
                                text: "Barchasini o'chirish ❌",
                                callback_data: `deleteInlineAds`
                            }
                        ],
                        [
                            {
                                text: "Oxirgisini o'chirish ❌",
                                callback_data: `deleteLastAds`
                            }
                        ]
                    ]
                    await bot.sendMessage(message.chat.id, `Reklama muvaffaqiyatli yaratildi!\n#id: ${inlineAd.uuid}`, {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    })
                } else {
                    await bot.sendMessage(message.chat.id, `Matn ko'rinishida yuboring!`)
                }
            }

        } catch (e) {
            console.log(e)
        }
    }

    static async manageStartAds(bot, db, message, user) {
        try {

        } catch (e) {
            console.log(e)
        }
    }

    static async getInlineResult(bot, db, query) {
        try {
            let results = []
            let voices

            let inlineAd = await db.inline_ads.findOne({
                where: {
                    isActive: true
                },
                order: [ [ 'createdAt', 'DESC' ]],
                raw: true
            })

            if (inlineAd) {
                results.push({
                    type: 'article',
                    id: `${inlineAd.uuid}`,
                    title: `${inlineAd.title}`,
                    thumb_url: `${inlineAd.thumb_url}`,
                    description: `${inlineAd.description}`,
                    input_message_content: {
                        message_text: `${inlineAd.message_text}`,
                        parse_mode: "HTML"
                    },
                    // reply_markup: {
                    //     "inline_keyboard": [
                    //         [{
                    //             "text": "InlineFeatures.",
                    //             "url": "https://www.fcb.uz"
                    //         }],
                    //         [{
                    //             "text": "OtherFeatures.",
                    //             "url": "https://www.fcb.uz"
                    //         }]
                    //     ]
                    // }
                })
            }

            voices = await db.audios.findAndCountAll({
                raw: true,
                order: [ [ 'createdAt', 'DESC' ]],
                include: {
                    model: db.voice_counts
                }
            })


            if (query?.query) {
                voices = await db.audios.findAndCountAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${query.query}%`
                        }
                    },
                    order: [ [ 'createdAt', 'DESC' ]],
                    raw: true,
                    include: {
                        model: db.voice_counts
                    }
                })
            }

            for (let voice of voices.rows) {
                results.push({
                    type: 'voice',
                    id: voice.id,
                    voice_file_id: voice.file_id,
                    title: `${voice.name} - ${voice['voice_count.count']}`
                })
            }

            if (voices.count === 0) {
                await bot.answerInlineQuery(query.id, results, {
                    cache_time: 0,
                    is_personal: true,
                    switch_pm_text: "Ovoz topilmadi! Taklif qilish",
                    switch_pm_parameter: "convert"
                })
            } else {
                await bot.answerInlineQuery(query.id, results, {
                    cache_time: 0,
                    is_personal: true,
                    switch_pm_text: "Barcha ovozlarni ko'rish",
                    switch_pm_parameter: "convert"
                })
            }

        } catch (e) {
            console.log(e)
        }
    }

    static async addInlineUser(bot, db, query) {
        try {
            let user = await db.inline_users.findOne({
                where: {
                    user_id: `${query.from.id}`
                }
            })

            if (!user) {
                await db.inline_users.create({
                    user_id: query.from.id,
                    name: query.from.first_name,
                    username: query.from.username
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async countInlineQuery(bot, db, query) {
        try {
            let inlineQuery = await db.inline_query_counts.findOne({
                order: [["createdAt", "DESC"]],
                raw: true
            })

            if (!inlineQuery) {
                await db.inline_query_counts.create({
                    count: 1
                })
            } else {
                await db.inline_query_counts.increment({
                    count: 1
                }, {
                    where: {
                        uuid: inlineQuery.uuid
                    }
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async editVoice(bot, db, message, user) {
        try {
            if (user?.step === 10 && message?.voice) {
                await db.audios.update({
                    file_id: message.voice.file_id,
                    file_unique_id: message.voice.file_unique_id
                }, {
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                let voice = await db.audios.findOne({
                    where: {
                        file_unique_id: message.voice.file_unique_id
                    }
                })

                await bot.sendMessage(message.chat.id, `Audio o'zgartirildi.`)

                await db.users.update({
                    step: 1,
                    activeID: null
                }, {
                    where: {
                        user_id: `${message.chat.id}`
                    }
                })

                let keyboard

                if (user.role === 'admin' || user.role === 'moderator') {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice?.name}`
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'zgartirish",
                                callback_data: "change_voice"
                            }
                        ],
                        [
                            {
                                text: "Nomni o'zgartirish",
                                callback_data: "change_name"
                            },
                            {
                                text: "Teglarni o'zgartirish",
                                callback_data: "change_tags"
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'chirish",
                                callback_data: "off_voice"
                            }
                        ]
                    ]
                } else {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice.name}`
                            }
                        ]
                    ]
                }

                await bot.sendVoice(message.chat.id, voice.file_id, {
                    caption: `<b>Nomi:</b> ${voice.name}\n<b>Teglar:</b> ${voice.tags.join(', ')}\n<b>Ishlatilgan:</b> 1 marta`,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                })
            } else if (user.step === 11 && message.text !== '⬅️Ortga') {
                await db.audios.update({
                    name: message?.text || 'ovozqani'
                }, {
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                let voice = await db.audios.findOne({
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                await bot.sendMessage(message.chat.id, `Audio nomi o'zgartirildi.`)

                await db.users.update({
                    step: 1,
                    activeID: null
                }, {
                    where: {
                        user_id: `${message.chat.id}`
                    }
                })

                let keyboard

                if (user.role === 'admin' || user.role === 'moderator') {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice?.name}`
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'zgartirish",
                                callback_data: "change_voice"
                            }
                        ],
                        [
                            {
                                text: "Nomni o'zgartirish",
                                callback_data: "change_name"
                            },
                            {
                                text: "Teglarni o'zgartirish",
                                callback_data: "change_tags"
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'chirish",
                                callback_data: "off_voice"
                            }
                        ]
                    ]
                } else {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice.name}`
                            }
                        ]
                    ]
                }

                await bot.sendVoice(message.chat.id, voice.file_id, {
                    caption: `<b>Nomi:</b> ${voice.name}\n<b>Teglar:</b> ${voice.tags.join(', ')}\n<b>Ishlatilgan:</b> 1 marta`,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                })
            } else if (user.step === 12 && message.text !== '⬅️Ortga') {
                await db.audios.update({
                    tags: message?.text.split(" ") || ['ovozqani']
                }, {
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                let voice = await db.audios.findOne({
                    where: {
                        file_unique_id: user.activeID
                    }
                })

                await bot.sendMessage(message.chat.id, `Audio teglari o'zgartirildi.`)

                await db.users.update({
                    step: 1,
                    activeID: null
                }, {
                    where: {
                        user_id: `${message.chat.id}`
                    }
                })

                let keyboard

                if (user.role === 'admin' || user.role === 'moderator') {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice?.name}`
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'zgartirish",
                                callback_data: "change_voice"
                            }
                        ],
                        [
                            {
                                text: "Nomni o'zgartirish",
                                callback_data: "change_name"
                            },
                            {
                                text: "Teglarni o'zgartirish",
                                callback_data: "change_tags"
                            }
                        ],
                        [
                            {
                                text: "Ovozni o'chirish",
                                callback_data: "off_voice"
                            }
                        ]
                    ]
                } else {
                    keyboard = [
                        [
                            {
                                text: "Ulashish 🔁",
                                switch_inline_query: `${voice.name}`
                            }
                        ]
                    ]
                }

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

    static async countInlineResult(bot, db, result) {
        try {
            let voice = await db.audios.findOne({
                where: {
                    id: Number(result.result_id)
                },
                raw: true
            })

            let findVoice = await db.voice_counts.findOne({
                where: {
                    voice_id: voice.uuid
                }
            })

            if (!findVoice) {
                await db.voice_counts.create({
                    count: 1,
                    voice_id: voice.uuid
                })
            } else {
                await db.voice_counts.increment({
                    count: 1
                }, {
                    where: {
                        voice_id: voice.uuid
                    }
                })
            }
        } catch (e) {
            console.log(e)
        }
    }
}
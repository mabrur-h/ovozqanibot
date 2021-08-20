export default class Commands {

    static async onStart(bot, db, message) {
        let findUser = await db.users.findOne({
            where: {
                user_id: `${message.from.id}`
            }
        })
        if (findUser) {
            await bot.sendMessage(message.chat.id, 'user found')
        } else {
            let user = await db.users.create({
                user_id: message.from.id,
                name: message.from.first_name,
                username: message.from.username
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
    }

    static async randomVoice(bot, db, message) {
        let file = await bot.getFile("AwACAgQAAxkBAAIwn2EgMwrZiMGP5xQvU1S2PzV953jvAAJiGgACwoJwUHCRSEZmgqEVIAQ")
        await bot.sendVoice(message.chat.id, file.file_id)
    }

}
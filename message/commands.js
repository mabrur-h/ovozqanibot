module.exports = async (message, bot) => {
    const chatId = message.chat.id;
    const text = message.text;

    if ( text === '/start' ) {
        await bot.sendMessage(chatId, `<b>Канал</b> - https://t.me/joinchat/UEOeiBLpY5xmNGQy`, {
            parse_mode: "HTML"
        })
    }

    console.log (message)
}

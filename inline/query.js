module.exports = async (query, bot) => {
    const results = [{
        type: 'article',
        id: 'location',
        title: 'Address',
        input_message_content: {
            message_text: 'Change Location'
        },
        thumb_url: "https://pacificalloy.com/wp-content/uploads/2019/03/location-icon.png",
        description: 'Send location'
    }]

    const text = query.query;
    const userId = query.from.id;

    if ( text === 'test' ) {

        for (let i = 1; i < 3; i++) {
            results.push({
                type: 'audio',
                id: i.toString(),
                audio_url: `https://file.io/ZTOK1xE9uKbt`,
                title: "OVOZLAR",
                caption: '12312 marta',
                audio_duration: "12",
                input_message_content: {
                    message_text: `send ${i}`
                }
            })
        }

        await bot.answerInlineQuery ( query.id, results, {
            cache_time: 0
        } )

    }

}

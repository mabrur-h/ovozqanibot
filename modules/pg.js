import config from "../config.js";
import {Sequelize} from "sequelize"
import Models from "../models/models.js";

const sequelize = new Sequelize(config.PG_CONNECTION_STRING, {
    logging: false
})

async function postgres () {
    try {
        let db = {};

        db.users = await Models.UserModel(Sequelize, sequelize)
        db.audios = await Models.AudioModel(Sequelize, sequelize)
        db.inline_ads = await Models.InlineAdsModel(Sequelize, sequelize)
        db.inline_users = await Models.InlineUserModel(Sequelize, sequelize)
        db.voice_counts = await Models.voiceCounterModel(Sequelize, sequelize)
        db.inline_query_counts = await Models.inlineQueryCounterModel(Sequelize, sequelize)

        await db.audios.hasOne(db.voice_counts, {
            foreignKey: {
                name: 'voice_id',
                allowNull: false
            }
        })

        await db.voice_counts.belongsTo(db.audios, {
            foreignKey: {
                name: 'voice_id',
                allowNull: false
            }
        })

        await sequelize.sync({force: false})
        return db

    } catch (e) {
        console.log("DB-ERROR:", e)
    }
}

export default postgres


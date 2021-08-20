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

        await sequelize.sync({force: false})
        return db

    } catch (e) {
        console.log("DB-ERROR:", e)
    }
}

export default postgres


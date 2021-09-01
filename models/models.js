export default class Models {

    static async UserModel (Sequelize, sequelize) {
        return sequelize.define('users', {
            user_id: {
                type: Sequelize.DataTypes.STRING,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            username: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            role: {
                type: Sequelize.DataTypes.ENUM,
                values: ["admin", "moderator", "user"],
                defaultValue: "user"
            },
            step: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            activeID: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            }
        })
    }

    static async AudioModel (Sequelize, sequelize) {
        return sequelize.define('audios', {
            uuid: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.DataTypes.UUIDV4()
            },
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            file_id: {
                type: Sequelize.DataTypes.STRING,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                defaultValue: 'name'
            },
            tags: {
                type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
                allowNull: true,
                defaultValue: ['tag']
            }
        })
    }

    static async InlineAdsModel (Sequelize, sequelize) {
        return sequelize.define('inline_ads', {
            uuid: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.DataTypes.UUIDV4()
            },
            title: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            thumb_url: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            description: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            message_text: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            keyboard: {
                type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
                allowNull: true
            },
            isActive: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            }
        })
    }

}
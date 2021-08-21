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
            }
        })
    }

    static async AudioModel (Sequelize, sequelize) {
        return sequelize.define('audios', {
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
            },
            tags: {
                type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
                allowNull: true
            }
        })
    }

}
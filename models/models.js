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
            }
        })
    }

}
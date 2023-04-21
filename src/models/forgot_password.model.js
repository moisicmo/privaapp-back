const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const forgotPasswordModel = dbConnection.define("forgot_passwords", {
  user_id: {
    type: DataTypes.INTEGER,
  },
  code: {
    type: DataTypes.STRING,
  },
});
module.exports = forgotPasswordModel;

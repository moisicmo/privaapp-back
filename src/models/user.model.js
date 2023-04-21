const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const userModel = dbConnection.define("users", {
  name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.INTEGER,
  },
  gender: {
    type: DataTypes.STRING,
  },
  number_wp: {
    type: DataTypes.INTEGER,
  },
  code: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  tk_notification: {
    type: DataTypes.STRING,
  },
  online: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  state: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
});
module.exports = userModel;

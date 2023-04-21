const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const alertModel = dbConnection.define("alerts", {
  user_id: {
    type: DataTypes.INTEGER,
  },
  group_id: {
    type: DataTypes.INTEGER,
  },
  latitude: {
    type: DataTypes.STRING,
  },
  longitude: {
    type: DataTypes.STRING,
  },
});
module.exports = alertModel;

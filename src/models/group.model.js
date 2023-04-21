const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const groupModel = dbConnection.define("groups", {
  name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  level: {
    type: DataTypes.STRING,
    defaultValue: "Bajo"
  },
  state: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
});
module.exports = groupModel;

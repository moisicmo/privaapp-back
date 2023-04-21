const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const userGroupModel = dbConnection.define("user_groups", {
  user_id: {
    type: DataTypes.INTEGER,
  },
  group_id: {
    type: DataTypes.INTEGER,
  },
  reason: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
});
module.exports = userGroupModel;

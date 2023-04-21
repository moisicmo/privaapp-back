const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const guestModel = dbConnection.define("guests", {
  user_id: {
    type: DataTypes.INTEGER,
  },
  group_id: {
    type: DataTypes.INTEGER,
  },
  guest_id: {
    type: DataTypes.INTEGER,
  },
  code: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

});
module.exports = guestModel;

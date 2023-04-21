const DataTypes = require("sequelize");
const dbConnection = require("../configdb");
const contentModel = dbConnection.define("contents", {
  alert_id: {
    type: DataTypes.INTEGER,
  },
  url_file: {
    type: DataTypes.STRING,
  },
  type_file: {
    type: DataTypes.STRING,
  }
});
module.exports = contentModel;

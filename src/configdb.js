const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    database: process.env.DATABASEDB,
    username: process.env.USERNAMEDB,
    password: process.env.PWDDB,
    dialect: 'mysql',
    host: process.env.HOSTDB,
    timezone: '-04:00',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000
    }
  });
module.exports=sequelize;
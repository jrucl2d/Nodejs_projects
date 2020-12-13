require("dotenv").config();

module.exports = {
  development: {
    username: process.env.SEQUELIZE_USER,
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: "false",
  },
  production: {
    username: process.env.SEQUELIZE_USER,
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: "false",
    loggin: false,
  },
};

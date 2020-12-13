const Sequelize = require("sequelize");
const User = require("./user");
const Auction = require("./auction");
const Good = require("./good");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const db = {};

db.sequelize = sequelize;
db.User = User;
db.Auction = Auction;
db.Good = Good;

User.init(sequelize);
Auction.init(sequelize);
Good.init(sequelize);
User.associate(db);
Auction.associate(db);
Good.associate(db);

module.exports = db;

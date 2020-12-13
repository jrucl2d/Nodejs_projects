// first need to write 'sequelize init'
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(path.join("..", "config", "config.json"))[env];

// Database Settings
const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Model Settings
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");
const Domain = require("./domain");
db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;
db.Domain = Domain;

// Initializations and Associations. These are static methods
User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);
Domain.init(sequelize);
User.associate(db);
Post.associate(db);
Hashtag.associate(db);
Domain.associate(db);

module.exports = db;

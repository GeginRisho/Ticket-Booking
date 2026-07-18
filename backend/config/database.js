const { Sequelize } = require("sequelize");
const dbConfig = require("./dbConfig");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  const config = dbConfig[env];
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

module.exports = sequelize;
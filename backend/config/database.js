const { Sequelize } = require("sequelize");
const dbConfig = require("./dbConfig");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

let sequelize;
const config = dbConfig[env] || {};

const globalDefineOptions = {
  underscored: true,
  timestamps: true,
  paranoid: true
};

if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    define: {
      ...globalDefineOptions,
      ...config.define
    }
  });
} else if (process.env.DATABASE_URL) {
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
    define: globalDefineOptions
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...config,
      define: {
        ...globalDefineOptions,
        ...config.define
      }
    }
  );
}

module.exports = sequelize;
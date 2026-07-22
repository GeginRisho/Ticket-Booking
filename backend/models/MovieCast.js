const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovieCast = sequelize.define('MovieCast', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  movie_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  actor_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  character_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'movie_casts',
  paranoid: true
});

module.exports = MovieCast;

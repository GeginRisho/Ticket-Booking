const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  poster: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false,
    validate: {
      min: 1
    }
  },
  age_rating: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['U', 'UA', 'A', 'R', 'PG', 'PG-13']]
    }
  },
  release_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  trailer_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'coming_soon',
    validate: {
      isIn: [['coming_soon', 'now_showing', 'ended']]
    }
  }
}, {
  tableName: 'movies',
  paranoid: true
});

module.exports = Movie;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  movie_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'user_id'],
      name: 'reviews_movie_user_uidx',
      where: {
        movie_id: {
          [require('sequelize').Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['event_id', 'user_id'],
      name: 'reviews_event_user_uidx',
      where: {
        event_id: {
          [require('sequelize').Op.ne]: null
        }
      }
    }
  ]
});

module.exports = Review;

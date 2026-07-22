const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'wishlists',
  paranoid: true,
  validate: {
    eitherMovieOrEvent() {
      if (!this.movie_id && !this.event_id) {
        throw new Error('Wishlist must reference either a movie or an event.');
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'movie_id'],
      name: 'wishlists_user_movie_uidx',
      where: {
        movie_id: { [require('sequelize').Op.ne]: null }
      }
    },
    {
      unique: true,
      fields: ['user_id', 'event_id'],
      name: 'wishlists_user_event_uidx',
      where: {
        event_id: { [require('sequelize').Op.ne]: null }
      }
    }
  ]
});

module.exports = Wishlist;

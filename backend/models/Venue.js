const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizer_id: {
    type: DataTypes.UUID,
    allowNull: true // null for global/admin venues
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  seating_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  maps_location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parking_information: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'venues',
  paranoid: true
});

module.exports = Venue;

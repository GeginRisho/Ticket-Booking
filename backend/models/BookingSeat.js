const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingSeat = sequelize.define('BookingSeat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  seat_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'booking_seats',
  paranoid: true
});

module.exports = BookingSeat;

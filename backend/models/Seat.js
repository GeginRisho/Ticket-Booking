const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  screen_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  seat_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  seat_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Normal', 'Premium', 'VIP', 'Recliner']]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'seats',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['screen_id', 'seat_number'],
      name: 'unique_screen_seat'
    }
  ]
});

module.exports = Seat;

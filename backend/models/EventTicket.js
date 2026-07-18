const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventTicket = sequelize.define('EventTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ticket_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'event_tickets',
  paranoid: true
});

module.exports = EventTicket;

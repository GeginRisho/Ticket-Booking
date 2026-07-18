const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  show_id: {
    type: DataTypes.UUID,
    allowNull: true // Null if it is an event ticket booking
  },
  event_ticket_id: {
    type: DataTypes.UUID,
    allowNull: true // Null if it is a movie show booking
  },
  booking_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  booking_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'cancelled', 'failed']]
    }
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'refunded', 'failed']]
    }
  },
  qr_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ticket_pdf: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['booking_number'],
      name: 'unique_booking_number'
    }
  ]
});

module.exports = Booking;

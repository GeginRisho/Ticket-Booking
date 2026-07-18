const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  gateway: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'success', 'failed', 'refunded']]
    }
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['transaction_id'],
      name: 'unique_transaction_id'
    }
  ]
});

module.exports = Payment;

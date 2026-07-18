const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processed', 'failed']]
    }
  }
}, {
  tableName: 'refunds',
  paranoid: true
});

module.exports = Refund;

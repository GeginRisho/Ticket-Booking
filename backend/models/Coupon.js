const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  discount_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['percentage', 'flat']]
    }
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  minimum_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive']]
    }
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  applicable_categories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  group_discount_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'coupons',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['coupon_code'],
      name: 'coupons_coupon_code_uidx'
    }
  ]
});

module.exports = Coupon;

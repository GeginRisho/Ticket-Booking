const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Theatre = sequelize.define('Theatre', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true // Owner is optional (managed by theatre owners)
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  theatre_name: {
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
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending_approval',
    validate: {
      isIn: [['active', 'inactive', 'pending_approval']]
    }
  }
}, {
  tableName: 'theatres',
  paranoid: true
});

module.exports = Theatre;

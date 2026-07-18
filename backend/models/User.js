const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'suspended']]
    }
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  paranoid: true
});

module.exports = User;

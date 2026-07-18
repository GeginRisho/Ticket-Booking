const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Screen = sequelize.define('Screen', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  theatre_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  screen_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  rows: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  columns: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'screens',
  paranoid: true
});

module.exports = Screen;

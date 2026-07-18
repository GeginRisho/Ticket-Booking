const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Show = sequelize.define('Show', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  movie_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  screen_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  show_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  format: {
    type: DataTypes.STRING, // 2D, 3D, IMAX, etc.
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'cancelled', 'sold_out']]
    }
  }
}, {
  tableName: 'shows',
  paranoid: true
});

module.exports = Show;

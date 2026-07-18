const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isIn: [['Admin', 'Customer', 'Theatre Owner', 'Event Organizer']]
    }
  }
}, {
  tableName: 'roles',
  paranoid: true
});

module.exports = Role;

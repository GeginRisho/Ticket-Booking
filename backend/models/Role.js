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
      isIn: [['Admin', 'Customer', 'Theatre Owner', 'Event Organizer', 'Super Admin', 'admin', 'customer', 'theatre_owner', 'event_organizer', 'super_admin']]
    },
    get() {
      const rawValue = this.getDataValue('role_name');
      if (!rawValue) return null;
      // Map database snake_case back to capitalized/spaced format for code compatibility
      const mapping = {
        'admin': 'Admin',
        'super_admin': 'Super Admin',
        'theatre_owner': 'Theatre Owner',
        'event_organizer': 'Event Organizer',
        'customer': 'Customer'
      };
      return mapping[rawValue.toLowerCase()] || rawValue;
    },
    set(val) {
      if (val) {
        this.setDataValue('role_name', val.toLowerCase().replace(/\s+/g, '_'));
      }
    }
  }
}, {
  tableName: 'roles',
  paranoid: true
});

module.exports = Role;

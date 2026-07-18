const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRefreshToken = sequelize.define('UserRefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'user_refresh_tokens',
  timestamps: true, // created_at, updated_at
  paranoid: false  // Refresh tokens don't need soft deletes, we can hard delete on logout/revocation
});

module.exports = UserRefreshToken;

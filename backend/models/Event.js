const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizer_id: {
    type: DataTypes.UUID,
    allowNull: true // Organizer user
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  age_restriction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft',
    validate: {
      isIn: [['active', 'cancelled', 'completed', 'draft', 'pending_approval', 'approved', 'published', 'archived']]
    }
  },
  has_reserved_seating: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  seating_layout: {
    type: DataTypes.JSON,
    allowNull: true
  },
  media_links: {
    type: DataTypes.JSON,
    allowNull: true
  },
  refund_policy_details: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      cancellation_deadline: 24,
      refund_percentage: 100,
      non_refundable: false
    }
  }
}, {
  tableName: 'events',
  paranoid: true
});

module.exports = Event;

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('events');
    const colsToAdd = {
      venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'venues',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      gallery_images: { type: Sequelize.JSON, allowNull: true },
      time: { type: Sequelize.STRING, allowNull: true },
      capacity: { type: Sequelize.INTEGER, allowNull: true },
      age_restriction: { type: Sequelize.STRING, allowNull: true },
      languages: { type: Sequelize.JSON, allowNull: true },
      tags: { type: Sequelize.JSON, allowNull: true },
      has_reserved_seating: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      seating_layout: { type: Sequelize.JSON, allowNull: true },
      media_links: { type: Sequelize.JSON, allowNull: true },
      refund_policy_details: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          cancellation_deadline: 24,
          refund_percentage: 100,
          non_refundable: false
        }
      }
    };

    for (const [colName, colSpec] of Object.entries(colsToAdd)) {
      if (!tableCols[colName]) {
        await queryInterface.addColumn('events', colName, colSpec);
      }
    }

    try {
      const indexes = await queryInterface.showIndex('events');
      const exists = indexes.some(idx => idx.name === 'events_venue_id_idx');
      if (!exists) {
        await queryInterface.addIndex('events', ['venue_id'], { name: 'events_venue_id_idx' });
      }
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('events');
    try {
      const indexes = await queryInterface.showIndex('events');
      const exists = indexes.some(idx => idx.name === 'events_venue_id_idx');
      if (exists) {
        await queryInterface.removeIndex('events', 'events_venue_id_idx');
      }
    } catch (e) {}

    const colsToRemove = [
      'venue_id', 'gallery_images', 'time', 'capacity', 'age_restriction', 'languages',
      'tags', 'has_reserved_seating', 'seating_layout', 'media_links', 'refund_policy_details'
    ];
    for (const colName of colsToRemove) {
      if (tableCols[colName]) {
        await queryInterface.removeColumn('events', colName);
      }
    }
  }
};

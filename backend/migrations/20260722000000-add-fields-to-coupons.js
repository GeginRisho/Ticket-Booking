'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('coupons');
    const colsToAdd = {
      event_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      applicable_categories: { type: Sequelize.JSON, allowNull: true },
      group_discount_size: { type: Sequelize.INTEGER, allowNull: true },
      start_date: { type: Sequelize.DATE, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAdd)) {
      if (!tableCols[colName]) {
        await queryInterface.addColumn('coupons', colName, colSpec);
      }
    }

    try {
      const indexes = await queryInterface.showIndex('coupons');
      const exists = indexes.some(idx => idx.name === 'coupons_event_id_idx');
      if (!exists) {
        await queryInterface.addIndex('coupons', ['event_id'], { name: 'coupons_event_id_idx' });
      }
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('coupons');
    try {
      const indexes = await queryInterface.showIndex('coupons');
      const exists = indexes.some(idx => idx.name === 'coupons_event_id_idx');
      if (exists) {
        await queryInterface.removeIndex('coupons', 'coupons_event_id_idx');
      }
    } catch (e) {}

    const colsToRemove = ['event_id', 'applicable_categories', 'group_discount_size', 'start_date'];
    for (const colName of colsToRemove) {
      if (tableCols[colName]) {
        await queryInterface.removeColumn('coupons', colName);
      }
    }
  }
};

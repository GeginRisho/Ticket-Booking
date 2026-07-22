'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('event_tickets');
    const colsToAdd = {
      sales_window_start: { type: Sequelize.DATE, allowNull: true },
      sales_window_end: { type: Sequelize.DATE, allowNull: true },
      booking_limit: { type: Sequelize.INTEGER, allowNull: true },
      refund_policy: { type: Sequelize.TEXT, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAdd)) {
      if (!tableCols[colName]) {
        await queryInterface.addColumn('event_tickets', colName, colSpec);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('event_tickets');
    const colsToRemove = ['sales_window_start', 'sales_window_end', 'booking_limit', 'refund_policy'];
    for (const colName of colsToRemove) {
      if (tableCols[colName]) {
        await queryInterface.removeColumn('event_tickets', colName);
      }
    }
  }
};

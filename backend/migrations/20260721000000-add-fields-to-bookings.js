'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('bookings');
    const colsToAdd = {
      checked_in: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      checked_in_at: { type: Sequelize.DATE, allowNull: true },
      booked_seats: { type: Sequelize.JSON, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAdd)) {
      if (!tableCols[colName]) {
        await queryInterface.addColumn('bookings', colName, colSpec);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('bookings');
    const colsToRemove = ['checked_in', 'checked_in_at', 'booked_seats'];
    for (const colName of colsToRemove) {
      if (tableCols[colName]) {
        await queryInterface.removeColumn('bookings', colName);
      }
    }
  }
};

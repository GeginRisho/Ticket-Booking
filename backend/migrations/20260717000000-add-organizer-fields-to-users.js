'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('users');
    const colsToAdd = {
      company_name: { type: Sequelize.STRING, allowNull: true },
      company_logo: { type: Sequelize.STRING, allowNull: true },
      organizer_photo: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      business_details: { type: Sequelize.TEXT, allowNull: true },
      bank_account: { type: Sequelize.STRING, allowNull: true },
      gst_number: { type: Sequelize.STRING, allowNull: true },
      pan_number: { type: Sequelize.STRING, allowNull: true },
      business_license: { type: Sequelize.STRING, allowNull: true },
      social_media_links: { type: Sequelize.JSON, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAdd)) {
      if (!tableCols[colName]) {
        await queryInterface.addColumn('users', colName, colSpec);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('users');
    const colsToRemove = [
      'company_name', 'company_logo', 'organizer_photo', 'address', 'business_details',
      'bank_account', 'gst_number', 'pan_number', 'business_license', 'social_media_links'
    ];
    for (const colName of colsToRemove) {
      if (tableCols[colName]) {
        await queryInterface.removeColumn('users', colName);
      }
    }
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Get all tables in the public schema
    const tablesList = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != 'SequelizeMeta'
        AND table_name != 'spatial_ref_sys'
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    for (const row of tablesList) {
      const tableName = row.table_name;
      const columns = await queryInterface.describeTable(tableName);

      // Check and add created_at
      if (!columns.created_at) {
        console.log(`Adding created_at column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()')
        });
      }

      // Check and add updated_at
      if (!columns.updated_at) {
        console.log(`Adding updated_at column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()')
        });
      }

      // Check and add deleted_at (except user_refresh_tokens)
      if (tableName !== 'user_refresh_tokens' && !columns.deleted_at) {
        console.log(`Adding deleted_at column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Heal migration does not require rollback actions
  }
};

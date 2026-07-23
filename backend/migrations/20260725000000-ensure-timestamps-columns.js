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

      // Check and add createdAt
      if (!columns.createdAt) {
        console.log(`Adding createdAt column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'createdAt', {
          type: Sequelize.DATE,
          allowNull: true
        });

        // Copy data from created_at if it exists
        if (columns.created_at) {
          await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "createdAt" = "created_at"`);
        } else {
          await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "createdAt" = NOW()`);
        }

        // Set to non-nullable
        await queryInterface.changeColumn(tableName, 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false
        });
      }

      // Check and add updatedAt
      if (!columns.updatedAt) {
        console.log(`Adding updatedAt column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: true
        });

        // Copy data from updated_at if it exists
        if (columns.updated_at) {
          await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "updatedAt" = "updated_at"`);
        } else {
          await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "updatedAt" = NOW()`);
        }

        // Set to non-nullable
        await queryInterface.changeColumn(tableName, 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: false
        });
      }

      // Check and add deletedAt (except user_refresh_tokens)
      if (tableName !== 'user_refresh_tokens' && !columns.deletedAt) {
        console.log(`Adding deletedAt column to table: ${tableName}`);
        await queryInterface.addColumn(tableName, 'deletedAt', {
          type: Sequelize.DATE,
          allowNull: true
        });

        // Copy data from deleted_at if it exists
        if (columns.deleted_at) {
          await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "deletedAt" = "deleted_at"`);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Heal migration does not require rollback actions
  }
};

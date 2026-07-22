'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingTables = await queryInterface.showAllTables();
    if (!existingTables.includes('venues')) {
      await queryInterface.createTable('venues', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true,
          allowNull: false
        },
        organizer_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        city_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'cities',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        seating_capacity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        maps_location: {
          type: Sequelize.STRING,
          allowNull: true
        },
        parking_information: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        contact_number: {
          type: Sequelize.STRING,
          allowNull: true
        },
        gallery_images: {
          type: Sequelize.JSON,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      });

      try {
        await queryInterface.addIndex('venues', ['city_id'], { name: 'venues_city_id_idx' });
      } catch (e) {}
      try {
        await queryInterface.addIndex('venues', ['organizer_id'], { name: 'venues_organizer_id_idx' });
      } catch (e) {}
    }
  },

  down: async (queryInterface, Sequelize) => {
    const existingTables = await queryInterface.showAllTables();
    if (existingTables.includes('venues')) {
      await queryInterface.dropTable('venues');
    }
  }
};

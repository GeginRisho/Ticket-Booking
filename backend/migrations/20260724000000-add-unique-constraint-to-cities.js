'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clean up any potential duplicates before adding unique constraint (keeping the oldest record)
    await queryInterface.sequelize.query(`
      DELETE FROM cities a USING cities b
      WHERE a.id > b.id
        AND LOWER(TRIM(a.state)) = LOWER(TRIM(b.state))
        AND LOWER(TRIM(a.city_name)) = LOWER(TRIM(b.city_name))
    `);

    const [results] = await queryInterface.sequelize.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'cities_state_city_name_key'
    `);
    
    if (results.length === 0) {
      await queryInterface.addConstraint('cities', {
        fields: ['state', 'city_name'],
        type: 'unique',
        name: 'cities_state_city_name_key'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'cities_state_city_name_key'
    `);
    if (results.length > 0) {
      await queryInterface.removeConstraint('cities', 'cities_state_city_name_key');
    }
  }
};

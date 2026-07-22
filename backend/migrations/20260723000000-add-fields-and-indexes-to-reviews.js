'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('reviews');
    
    if (!tableCols.event_id) {
      await queryInterface.addColumn('reviews', 'event_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    if (tableCols.movie_id) {
      await queryInterface.changeColumn('reviews', 'movie_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    try {
      const indexes = await queryInterface.showIndex('reviews');
      const hasMovieUserUidx = indexes.some(idx => idx.name === 'reviews_movie_user_uidx');
      if (hasMovieUserUidx) {
        await queryInterface.removeIndex('reviews', 'reviews_movie_user_uidx');
      }
    } catch (e) {}

    try {
      await queryInterface.addIndex('reviews', ['movie_id', 'user_id'], {
        name: 'reviews_movie_user_uidx',
        unique: true,
        where: {
          movie_id: {
            [Sequelize.Op.ne]: null
          }
        }
      });
    } catch (e) {}

    try {
      const indexes = await queryInterface.showIndex('reviews');
      const hasEventUserUidx = indexes.some(idx => idx.name === 'reviews_event_user_uidx');
      if (!hasEventUserUidx) {
        await queryInterface.addIndex('reviews', ['event_id', 'user_id'], {
          name: 'reviews_event_user_uidx',
          unique: true,
          where: {
            event_id: {
              [Sequelize.Op.ne]: null
            }
          }
        });
      }
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    const tableCols = await queryInterface.describeTable('reviews');
    try {
      await queryInterface.removeIndex('reviews', 'reviews_event_user_uidx');
    } catch (e) {}
    try {
      await queryInterface.removeIndex('reviews', 'reviews_movie_user_uidx');
    } catch (e) {}

    // Restore old index without where clause
    try {
      await queryInterface.addIndex('reviews', ['movie_id', 'user_id'], {
        name: 'reviews_movie_user_uidx',
        unique: true
      });
    } catch (e) {}

    if (tableCols.movie_id) {
      await queryInterface.changeColumn('reviews', 'movie_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    if (tableCols.event_id) {
      await queryInterface.removeColumn('reviews', 'event_id');
    }
  }
};

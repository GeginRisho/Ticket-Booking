'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Venues Table if it doesn't exist
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('venues')) {
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

      // Venues indexes
      await queryInterface.addIndex('venues', ['city_id'], { name: 'venues_city_id_idx' });
      await queryInterface.addIndex('venues', ['organizer_id'], { name: 'venues_organizer_id_idx' });
    }

    // 2. Add organizer columns to users table
    const usersCols = await queryInterface.describeTable('users');
    const colsToAddUsers = {
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
    for (const [colName, colSpec] of Object.entries(colsToAddUsers)) {
      if (!usersCols[colName]) {
        await queryInterface.addColumn('users', colName, colSpec);
      }
    }

    // 3. Add venue/event configuration columns to events table
    const eventsCols = await queryInterface.describeTable('events');
    const colsToAddEvents = {
      venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'venues', key: 'id' },
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
    for (const [colName, colSpec] of Object.entries(colsToAddEvents)) {
      if (!eventsCols[colName]) {
        await queryInterface.addColumn('events', colName, colSpec);
      }
    }
    // event venue index
    try {
      await queryInterface.addIndex('events', ['venue_id'], { name: 'events_venue_id_idx' });
    } catch (e) {}

    // 4. Add check-in columns to bookings table
    const bookingsCols = await queryInterface.describeTable('bookings');
    const colsToAddBookings = {
      checked_in: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      checked_in_at: { type: Sequelize.DATE, allowNull: true },
      booked_seats: { type: Sequelize.JSON, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAddBookings)) {
      if (!bookingsCols[colName]) {
        await queryInterface.addColumn('bookings', colName, colSpec);
      }
    }

    // 5. Update reviews table (event_id, movie_id nullability, indexes)
    const reviewsCols = await queryInterface.describeTable('reviews');
    if (!reviewsCols.event_id) {
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

    if (reviewsCols.movie_id && !reviewsCols.movie_id.allowNull) {
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

    // Drop old unique index on (movie_id, user_id) if it exists
    try {
      await queryInterface.removeIndex('reviews', 'reviews_movie_user_uidx');
    } catch (e) {}

    // Add updated movie/event unique indexes with where clauses
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
      await queryInterface.addIndex('reviews', ['event_id', 'user_id'], {
        name: 'reviews_event_user_uidx',
        unique: true,
        where: {
          event_id: {
            [Sequelize.Op.ne]: null
          }
        }
      });
    } catch (e) {}

    // 6. Update coupons table
    const couponsCols = await queryInterface.describeTable('coupons');
    const colsToAddCoupons = {
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
    for (const [colName, colSpec] of Object.entries(colsToAddCoupons)) {
      if (!couponsCols[colName]) {
        await queryInterface.addColumn('coupons', colName, colSpec);
      }
    }
    // coupons event_id index
    try {
      await queryInterface.addIndex('coupons', ['event_id'], { name: 'coupons_event_id_idx' });
    } catch (e) {}

    // 7. Add missing fields to event_tickets table
    const eventTicketsCols = await queryInterface.describeTable('event_tickets');
    const colsToAddEventTickets = {
      sales_window_start: { type: Sequelize.DATE, allowNull: true },
      sales_window_end: { type: Sequelize.DATE, allowNull: true },
      booking_limit: { type: Sequelize.INTEGER, allowNull: true },
      refund_policy: { type: Sequelize.TEXT, allowNull: true }
    };
    for (const [colName, colSpec] of Object.entries(colsToAddEventTickets)) {
      if (!eventTicketsCols[colName]) {
        await queryInterface.addColumn('event_tickets', colName, colSpec);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 0. Rollback Event Tickets Table
    const eventTicketsCols = await queryInterface.describeTable('event_tickets');
    if (eventTicketsCols.refund_policy) await queryInterface.removeColumn('event_tickets', 'refund_policy');
    if (eventTicketsCols.booking_limit) await queryInterface.removeColumn('event_tickets', 'booking_limit');
    if (eventTicketsCols.sales_window_end) await queryInterface.removeColumn('event_tickets', 'sales_window_end');
    if (eventTicketsCols.sales_window_start) await queryInterface.removeColumn('event_tickets', 'sales_window_start');

    // 1. Rollback Coupons Table
    try {
      await queryInterface.removeIndex('coupons', 'coupons_event_id_idx');
    } catch (e) {}
    const couponsCols = await queryInterface.describeTable('coupons');
    if (couponsCols.start_date) await queryInterface.removeColumn('coupons', 'start_date');
    if (couponsCols.group_discount_size) await queryInterface.removeColumn('coupons', 'group_discount_size');
    if (couponsCols.applicable_categories) await queryInterface.removeColumn('coupons', 'applicable_categories');
    if (couponsCols.event_id) await queryInterface.removeColumn('coupons', 'event_id');

    // 2. Rollback Reviews Table
    try {
      await queryInterface.removeIndex('reviews', 'reviews_event_user_uidx');
    } catch (e) {}
    try {
      await queryInterface.removeIndex('reviews', 'reviews_movie_user_uidx');
    } catch (e) {}
    
    // Add back the index without where clause
    try {
      await queryInterface.addIndex('reviews', ['movie_id', 'user_id'], {
        name: 'reviews_movie_user_uidx',
        unique: true
      });
    } catch (e) {}

    const reviewsCols = await queryInterface.describeTable('reviews');
    if (reviewsCols.event_id) {
      await queryInterface.removeColumn('reviews', 'event_id');
    }
    if (reviewsCols.movie_id) {
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

    // 3. Rollback Bookings Table
    const bookingsCols = await queryInterface.describeTable('bookings');
    if (bookingsCols.booked_seats) await queryInterface.removeColumn('bookings', 'booked_seats');
    if (bookingsCols.checked_in_at) await queryInterface.removeColumn('bookings', 'checked_in_at');
    if (bookingsCols.checked_in) await queryInterface.removeColumn('bookings', 'checked_in');

    // 4. Rollback Events Table
    try {
      await queryInterface.removeIndex('events', 'events_venue_id_idx');
    } catch (e) {}
    const eventsCols = await queryInterface.describeTable('events');
    const colsToRemoveEvents = [
      'refund_policy_details', 'media_links', 'seating_layout',
      'has_reserved_seating', 'tags', 'languages', 'age_restriction',
      'capacity', 'time', 'gallery_images', 'venue_id'
    ];
    for (const colName of colsToRemoveEvents) {
      if (eventsCols[colName]) {
        await queryInterface.removeColumn('events', colName);
      }
    }

    // 5. Rollback Users Table
    const usersCols = await queryInterface.describeTable('users');
    const colsToRemoveUsers = [
      'social_media_links', 'business_license', 'pan_number',
      'gst_number', 'bank_account', 'business_details', 'address',
      'organizer_photo', 'company_logo', 'company_name'
    ];
    for (const colName of colsToRemoveUsers) {
      if (usersCols[colName]) {
        await queryInterface.removeColumn('users', colName);
      }
    }

    // 6. Rollback Venues Table
    const tables = await queryInterface.showAllTables();
    if (tables.includes('venues')) {
      await queryInterface.dropTable('venues');
    }
  }
};

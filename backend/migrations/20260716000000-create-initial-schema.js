'use strict';

const addIndexSafely = async (queryInterface, table, fields, options = {}) => {
  const indexName = options.name || fields.join('_');
  try {
    const indexes = await queryInterface.showIndex(table);
    const exists = indexes.some(idx => idx.name === indexName);
    if (exists) {
      console.log(`Index ${indexName} already exists on ${table}. Skipping.`);
      return;
    }
  } catch (err) {
    // If showIndex fails, ignore and let it try to add it
  }

  try {
    await queryInterface.addIndex(table, fields, options);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && (error.message.includes('already exists') || (error.parent && error.parent.code === '42P07'))) {
      console.log(`Index ${indexName} already exists on ${table}. Skipping.`);
    } else {
      throw error;
    }
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable uuid-ossp extension for UUID generation
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 1. Roles Table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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

    // 2. Cities Table
    await queryInterface.createTable('cities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      city_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
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

    // 3. Users Table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_logo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      organizer_photo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      business_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bank_account: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gst_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pan_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      business_license: {
        type: Sequelize.STRING,
        allowNull: true
      },
      social_media_links: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_login: {
        type: Sequelize.DATE,
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

    // 4. User Refresh Tokens Table
    await queryInterface.createTable('user_refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. Movies Table
    await queryInterface.createTable('movies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      poster: {
        type: Sequelize.STRING,
        allowNull: true
      },
      banner: {
        type: Sequelize.STRING,
        allowNull: true
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      age_rating: {
        type: Sequelize.STRING,
        allowNull: false
      },
      release_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      trailer_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'coming_soon',
        allowNull: false
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

    // 6. Movie Cast Table
    await queryInterface.createTable('movie_casts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      movie_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      actor_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      character_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      photo: {
        type: Sequelize.STRING,
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

    // 7. Theatres Table
    await queryInterface.createTable('theatres', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      owner_id: {
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
      theatre_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending_approval',
        allowNull: false
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

    // 8. Screens Table
    await queryInterface.createTable('screens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      theatre_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'theatres',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      screen_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rows: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      columns: {
        type: Sequelize.INTEGER,
        allowNull: false
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

    // 9. Seats Table
    await queryInterface.createTable('seats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      screen_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'screens',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      seat_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seat_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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

    // 10. Shows Table
    await queryInterface.createTable('shows', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      movie_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      screen_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'screens',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      show_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false
      },
      format: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
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

    // 11. Event Categories Table
    await queryInterface.createTable('event_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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

    // 11.5 Venues Table
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

    // 12. Events Table
    await queryInterface.createTable('events', {
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
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'event_categories',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      banner: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'venues',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      gallery_images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      age_restriction: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languages: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      has_reserved_seating: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      seating_layout: {
        type: Sequelize.JSON,
        allowNull: true
      },
      media_links: {
        type: Sequelize.JSON,
        allowNull: true
      },
      refund_policy_details: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          cancellation_deadline: 24,
          refund_percentage: 100,
          non_refundable: false
        }
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

    // 13. Event Tickets Table
    await queryInterface.createTable('event_tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      ticket_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sales_window_start: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sales_window_end: {
        type: Sequelize.DATE,
        allowNull: true
      },
      booking_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      refund_policy: {
        type: Sequelize.TEXT,
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

    // 14. Bookings Table
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      booking_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      show_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'shows',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      event_ticket_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'event_tickets',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      booking_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      booking_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      payment_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      qr_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ticket_pdf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      checked_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      checked_in_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      booked_seats: {
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

    // 15. Booking Seats Table
    await queryInterface.createTable('booking_seats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      seat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'seats',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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

    // 16. Payments Table
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      gateway: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      paid_at: {
        type: Sequelize.DATE,
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

    // 17. Refunds Table
    await queryInterface.createTable('refunds', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
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

    // 18. Wishlist Table
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      movie_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
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

    // 19. Reviews Table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      movie_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      review: {
        type: Sequelize.TEXT,
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

    // 20. Notifications Table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        defaultValue: 'general',
        allowNull: false
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
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

    // 21. Coupons Table
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      coupon_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      discount_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      minimum_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
      },
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
      applicable_categories: {
        type: Sequelize.JSON,
        allowNull: true
      },
      group_discount_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
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

    // 22. Support Tickets Table
    await queryInterface.createTable('support_tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open',
        allowNull: false
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

    // --- Create Custom Indexes for Performance Optimization ---
    
    // Users indexes
    await addIndexSafely(queryInterface, 'users', ['email'], { name: 'users_email_idx' });
    await addIndexSafely(queryInterface, 'users', ['phone'], { name: 'users_phone_idx' });
    await addIndexSafely(queryInterface, 'users', ['role_id'], { name: 'users_role_id_idx' });
    await addIndexSafely(queryInterface, 'users', ['city_id'], { name: 'users_city_id_idx' });

    // Theatres indexes
    await addIndexSafely(queryInterface, 'theatres', ['city_id'], { name: 'theatres_city_id_idx' });
    await addIndexSafely(queryInterface, 'theatres', ['owner_id'], { name: 'theatres_owner_id_idx' });

    // Screens index
    await addIndexSafely(queryInterface, 'screens', ['theatre_id'], { name: 'screens_theatre_id_idx' });

    // Seats index
    await addIndexSafely(queryInterface, 'seats', ['screen_id'], { name: 'seats_screen_id_idx' });
    await addIndexSafely(queryInterface, 'seats', ['screen_id', 'seat_number'], { name: 'seats_screen_id_seat_number_uidx', unique: true });

    // Shows indexes
    await addIndexSafely(queryInterface, 'shows', ['movie_id'], { name: 'shows_movie_id_idx' });
    await addIndexSafely(queryInterface, 'shows', ['screen_id'], { name: 'shows_screen_id_idx' });
    await addIndexSafely(queryInterface, 'shows', ['show_date'], { name: 'shows_show_date_idx' });

    // Bookings indexes
    await addIndexSafely(queryInterface, 'bookings', ['booking_number'], { name: 'bookings_booking_number_uidx', unique: true });
    await addIndexSafely(queryInterface, 'bookings', ['user_id'], { name: 'bookings_user_id_idx' });
    await addIndexSafely(queryInterface, 'bookings', ['show_id'], { name: 'bookings_show_id_idx' });
    await addIndexSafely(queryInterface, 'bookings', ['event_ticket_id'], { name: 'bookings_event_ticket_id_idx' });

    // Booking Seats indexes
    await addIndexSafely(queryInterface, 'booking_seats', ['booking_id'], { name: 'booking_seats_booking_id_idx' });
    await addIndexSafely(queryInterface, 'booking_seats', ['seat_id'], { name: 'booking_seats_seat_id_idx' });

    // Payments indexes
    await addIndexSafely(queryInterface, 'payments', ['transaction_id'], { name: 'payments_transaction_id_uidx', unique: true });
    await addIndexSafely(queryInterface, 'payments', ['booking_id'], { name: 'payments_booking_id_idx' });

    // Refunds index
    await addIndexSafely(queryInterface, 'refunds', ['payment_id'], { name: 'refunds_payment_id_idx' });

    // Events indexes
    await addIndexSafely(queryInterface, 'events', ['organizer_id'], { name: 'events_organizer_id_idx' });
    await addIndexSafely(queryInterface, 'events', ['category_id'], { name: 'events_category_id_idx' });
    await addIndexSafely(queryInterface, 'events', ['city_id'], { name: 'events_city_id_idx' });
    await addIndexSafely(queryInterface, 'events', ['venue_id'], { name: 'events_venue_id_idx' });

    // Venues indexes
    await addIndexSafely(queryInterface, 'venues', ['city_id'], { name: 'venues_city_id_idx' });
    await addIndexSafely(queryInterface, 'venues', ['organizer_id'], { name: 'venues_organizer_id_idx' });

    // Event tickets index
    await addIndexSafely(queryInterface, 'event_tickets', ['event_id'], { name: 'event_tickets_event_id_idx' });

    // Wishlist indexes
    await addIndexSafely(queryInterface, 'wishlists', ['user_id'], { name: 'wishlists_user_id_idx' });
    await addIndexSafely(queryInterface, 'wishlists', ['user_id', 'movie_id'], { name: 'wishlists_user_movie_uidx', unique: true, where: { movie_id: { [Sequelize.Op.ne]: null } } });
    await addIndexSafely(queryInterface, 'wishlists', ['user_id', 'event_id'], { name: 'wishlists_user_event_uidx', unique: true, where: { event_id: { [Sequelize.Op.ne]: null } } });

    // Reviews indexes
    await addIndexSafely(queryInterface, 'reviews', ['movie_id', 'user_id'], {
      name: 'reviews_movie_user_uidx',
      unique: true,
      where: {
        movie_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    await addIndexSafely(queryInterface, 'reviews', ['event_id', 'user_id'], {
      name: 'reviews_event_user_uidx',
      unique: true,
      where: {
        event_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Notifications index
    await addIndexSafely(queryInterface, 'notifications', ['user_id'], { name: 'notifications_user_id_idx' });

    // Coupons index
    await addIndexSafely(queryInterface, 'coupons', ['coupon_code'], { name: 'coupons_coupon_code_uidx', unique: true });
    await addIndexSafely(queryInterface, 'coupons', ['event_id'], { name: 'coupons_event_id_idx' });

    // Support tickets index
    await addIndexSafely(queryInterface, 'support_tickets', ['user_id'], { name: 'support_tickets_user_id_idx' });

    // Refresh Tokens index
    await addIndexSafely(queryInterface, 'user_refresh_tokens', ['user_id'], { name: 'user_refresh_tokens_user_id_idx' });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse order of creation to prevent FK violations
    await queryInterface.dropTable('user_refresh_tokens');
    await queryInterface.dropTable('support_tickets');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('wishlists');
    await queryInterface.dropTable('refunds');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('booking_seats');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('event_tickets');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('venues');
    await queryInterface.dropTable('event_categories');
    await queryInterface.dropTable('shows');
    await queryInterface.dropTable('seats');
    await queryInterface.dropTable('screens');
    await queryInterface.dropTable('theatres');
    await queryInterface.dropTable('movie_casts');
    await queryInterface.dropTable('movies');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('cities');
    await queryInterface.dropTable('roles');
  }
};

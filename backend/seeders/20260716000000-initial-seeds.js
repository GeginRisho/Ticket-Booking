'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Seed Roles
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'Admin', created_at: new Date(), updated_at: new Date() },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'Customer', created_at: new Date(), updated_at: new Date() },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'Theatre Owner', created_at: new Date(), updated_at: new Date() },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'Event Organizer', created_at: new Date(), updated_at: new Date() }
    ];
    await queryInterface.bulkInsert('roles', roles);

    // 2. Seed Cities
    const cities = [
      { id: 'a1111111-1111-1111-1111-111111111111', city_name: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 'a2222222-2222-2222-2222-222222222222', city_name: 'Delhi', state: 'Delhi', country: 'India', status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 'a3333333-3333-3333-3333-333333333333', city_name: 'Bangalore', state: 'Karnataka', country: 'India', status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 'a4444444-4444-4444-4444-444444444444', city_name: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'active', created_at: new Date(), updated_at: new Date() }
    ];
    await queryInterface.bulkInsert('cities', cities);

    // Hash passwords with 12 rounds
    const passwordHash = await bcrypt.hash('Password123!', 12);

    // 3. Seed Users
    const users = [
      {
        id: '10000000-1000-1000-1000-100000000000',
        full_name: 'Platform Admin',
        email: 'admin@ticketbooking.com',
        phone: '1234567890',
        password_hash: passwordHash,
        role_id: '11111111-1111-1111-1111-111111111111',
        city_id: 'a1111111-1111-1111-1111-111111111111',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '20000000-2000-2000-2000-200000000000',
        full_name: 'John Customer',
        email: 'customer@ticketbooking.com',
        phone: '9876543210',
        password_hash: passwordHash,
        role_id: '22222222-2222-2222-2222-222222222222',
        city_id: 'a3333333-3333-3333-3333-333333333333',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '30000000-3000-3000-3000-300000000000',
        full_name: 'Rex Theatre Owner',
        email: 'owner@ticketbooking.com',
        phone: '5556667777',
        password_hash: passwordHash,
        role_id: '33333333-3333-3333-3333-333333333333',
        city_id: 'a1111111-1111-1111-1111-111111111111',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '40000000-4000-4000-4000-400000000000',
        full_name: 'Star Event Organizer',
        email: 'organizer@ticketbooking.com',
        phone: '4443332221',
        password_hash: passwordHash,
        role_id: '44444444-4444-4444-4444-444444444444',
        city_id: 'a2222222-2222-2222-2222-222222222222',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await queryInterface.bulkInsert('users', users);

    // 4. Seed Movies
    const movies = [
      {
        id: '11111111-2222-3333-4444-555555555555',
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
        banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000',
        language: 'English',
        genre: 'Sci-Fi, Thriller',
        duration: 148,
        age_rating: 'UA',
        release_date: '2010-07-16',
        trailer_url: 'https://youtube.com/watch?v=YoHD9XEInc0',
        status: 'now_showing',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-3333-4444-5555-666666666666',
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
        poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
        banner: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1000',
        language: 'English',
        genre: 'Sci-Fi, Drama',
        duration: 169,
        age_rating: 'U',
        release_date: '2014-11-07',
        trailer_url: 'https://youtube.com/watch?v=zSWdZAZE3Tc',
        status: 'coming_soon',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await queryInterface.bulkInsert('movies', movies);

    // 5. Seed Event Categories
    const eventCategories = [
      { id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Concert', created_at: new Date(), updated_at: new Date() },
      { id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Standup Comedy', created_at: new Date(), updated_at: new Date() },
      { id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Theatre Play', created_at: new Date(), updated_at: new Date() }
    ];
    await queryInterface.bulkInsert('event_categories', eventCategories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('event_categories', null, {});
    await queryInterface.bulkDelete('movies', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('cities', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};

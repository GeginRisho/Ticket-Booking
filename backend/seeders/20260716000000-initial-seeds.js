'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Seed Roles
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'customer', createdAt: new Date(), updatedAt: new Date() },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'theatre_owner', createdAt: new Date(), updatedAt: new Date() },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'event_organizer', createdAt: new Date(), updatedAt: new Date() },
      { id: '55555555-5555-5555-5555-555555555555', role_name: 'super_admin', createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('roles', roles);

    // 2. Seed Cities
    const cities = [
      { id: 'a1111111-1111-1111-1111-111111111111', city_name: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2222222-2222-2222-2222-222222222222', city_name: 'Delhi', state: 'Delhi', country: 'India', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 'a3333333-3333-3333-3333-333333333333', city_name: 'Bangalore', state: 'Karnataka', country: 'India', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 'a4444444-4444-4444-4444-444444444444', city_name: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'active', createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('cities', cities);

    // Hash passwords
    const hashSuperAdmin = await bcrypt.hash('Admin@123', 12);
    const hashAdmin = await bcrypt.hash('Admin@123', 12);
    const hashOwner = await bcrypt.hash('Owner@123', 12);
    const hashCustomer = await bcrypt.hash('Customer@123', 12);
    const hashOrganizer = await bcrypt.hash('Organizer@123', 12);

    // 3. Seed Users
    const users = [
      {
        id: '50000000-5000-5000-5000-500000000000',
        full_name: 'Platform Super Admin',
        email: 'superadmin@ticketshow.com',
        phone: '+919876543209',
        password_hash: hashSuperAdmin,
        role_id: '55555555-5555-5555-5555-555555555555',
        city_id: 'a1111111-1111-1111-1111-111111111111',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '10000000-1000-1000-1000-100000000000',
        full_name: 'Platform Admin',
        email: 'admin@ticketshow.com',
        phone: '+919876543210',
        password_hash: hashAdmin,
        role_id: '11111111-1111-1111-1111-111111111111',
        city_id: 'a1111111-1111-1111-1111-111111111111',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '20000000-2000-2000-2000-200000000000',
        full_name: 'John Customer',
        email: 'customer@ticketshow.com',
        phone: '+919876543211',
        password_hash: hashCustomer,
        role_id: '22222222-2222-2222-2222-222222222222',
        city_id: 'a3333333-3333-3333-3333-333333333333',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '30000000-3000-3000-3000-300000000000',
        full_name: 'Rex Theatre Owner',
        email: 'owner@ticketshow.com',
        phone: '+919876543212',
        password_hash: hashOwner,
        role_id: '33333333-3333-3333-3333-333333333333',
        city_id: 'a1111111-1111-1111-1111-111111111111',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '40000000-4000-4000-4000-400000000000',
        full_name: 'Star Event Organizer',
        email: 'organizer@ticketshow.com',
        phone: '+919876543213',
        password_hash: hashOrganizer,
        role_id: '44444444-4444-4444-4444-444444444444',
        city_id: 'a3333333-3333-3333-3333-333333333333',
        status: 'active',
        email_verified: true,
        phone_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('movies', movies);

    // 5. Seed Event Categories
    const eventCategories = [
      { id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Concert', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Standup Comedy', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Theatre Play', createdAt: new Date(), updatedAt: new Date() }
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

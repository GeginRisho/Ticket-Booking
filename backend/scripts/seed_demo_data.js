const { 
  sequelize, City, Movie, MovieCast, EventCategory, 
  Event, EventTicket, Theatre, Screen, Seat, Show, 
  Coupon, Review, Notification, Role, User, Booking, BookingSeat, Payment 
} = require('../models');
const bcrypt = require('bcrypt');

const seedData = async () => {
  console.log('Starting massive enterprise-quality demo data seeding...');
  
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Truncate existing data to start with a clean, fully-orchestrated slate
    console.log('Truncating tables...');
    await sequelize.query('TRUNCATE TABLE booking_seats CASCADE;');
    await sequelize.query('TRUNCATE TABLE payments CASCADE;');
    await sequelize.query('TRUNCATE TABLE bookings CASCADE;');
    await sequelize.query('TRUNCATE TABLE shows CASCADE;');
    await sequelize.query('TRUNCATE TABLE seats CASCADE;');
    await sequelize.query('TRUNCATE TABLE screens CASCADE;');
    await sequelize.query('TRUNCATE TABLE theatres CASCADE;');
    await sequelize.query('TRUNCATE TABLE reviews CASCADE;');
    await sequelize.query('TRUNCATE TABLE wishlists CASCADE;');
    await sequelize.query('TRUNCATE TABLE event_tickets CASCADE;');
    await sequelize.query('TRUNCATE TABLE events CASCADE;');
    await sequelize.query('TRUNCATE TABLE event_categories CASCADE;');
    await sequelize.query('TRUNCATE TABLE movies CASCADE;');
    await sequelize.query('TRUNCATE TABLE movie_casts CASCADE;');
    await sequelize.query('TRUNCATE TABLE notifications CASCADE;');
    await sequelize.query('TRUNCATE TABLE coupons CASCADE;');
    await sequelize.query('TRUNCATE TABLE users CASCADE;');
    await sequelize.query('TRUNCATE TABLE cities CASCADE;');
    await sequelize.query('TRUNCATE TABLE roles CASCADE;');

    // 2. Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'Admin' },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'Customer' },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'Theatre Owner' },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'Event Organizer' }
    ];
    for (const r of roles) {
      await Role.create(r);
    }

    // 3. Seed 20+ Cities
    console.log('Seeding cities...');
    const cityList = [
      { id: 'a1111111-1111-1111-1111-111111111111', city_name: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'active' },
      { id: 'a2222222-2222-2222-2222-222222222222', city_name: 'Delhi', state: 'Delhi', country: 'India', status: 'active' },
      { id: 'a3333333-3333-3333-3333-333333333333', city_name: 'Bangalore', state: 'Karnataka', country: 'India', status: 'active' },
      { id: 'a4444444-4444-4444-4444-444444444444', city_name: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'a5555555-5555-5555-5555-555555555555', city_name: 'Hyderabad', state: 'Telangana', country: 'India', status: 'active' },
      { id: 'a6666666-6666-6666-6666-666666666666', city_name: 'Kolkata', state: 'West Bengal', country: 'India', status: 'active' },
      { id: 'a7777777-7777-7777-7777-777777777777', city_name: 'Pune', state: 'Maharashtra', country: 'India', status: 'active' },
      { id: 'a8888888-8888-8888-8888-888888888888', city_name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'a9999999-9999-9999-9999-999999999999', city_name: 'Madurai', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b1111111-1111-1111-1111-111111111111', city_name: 'Salem', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b2222222-2222-2222-2222-222222222222', city_name: 'Trichy', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b3333333-3333-3333-3333-333333333333', city_name: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b4444444-4444-4444-4444-444444444444', city_name: 'Erode', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b5555555-5555-5555-5555-555555555555', city_name: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b6666666-6666-6666-6666-666666666666', city_name: 'Vellore', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'b7777777-7777-7777-7777-777777777777', city_name: 'Kochi', state: 'Kerala', country: 'India', status: 'active' },
      { id: 'b8888888-8888-8888-8888-888888888888', city_name: 'Trivandrum', state: 'Kerala', country: 'India', status: 'active' },
      { id: 'b9999999-9999-9999-9999-999999999999', city_name: 'Mysore', state: 'Karnataka', country: 'India', status: 'active' },
      { id: 'c1111111-2222-3333-4444-555555555555', city_name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', status: 'active' },
      { id: 'c2222222-2222-3333-4444-555555555555', city_name: 'Ahmedabad', state: 'Gujarat', country: 'India', status: 'active' },
      { id: 'c3333333-2222-3333-4444-555555555555', city_name: 'Jaipur', state: 'Rajasthan', country: 'India', status: 'active' }
    ];
    for (const c of cityList) {
      await City.create(c);
    }

    // 4. Seed Users
    console.log('Seeding demo users...');
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const demoUsers = [
      { id: '10000000-1000-1000-1000-100000000000', full_name: 'Platform Admin', email: 'admin@ticketshow.com', phone: '+919876543210', password_hash: passwordHash, role_id: '11111111-1111-1111-1111-111111111111', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '20000000-2000-2000-2000-200000000000', full_name: 'John Customer', email: 'customer@ticketshow.com', phone: '+919876543211', password_hash: passwordHash, role_id: '22222222-2222-2222-2222-222222222222', city_id: 'a3333333-3333-3333-3333-333333333333', status: 'active', email_verified: true, phone_verified: true },
      { id: '30000000-3000-3000-3000-300000000000', full_name: 'Rex Theatre Owner', email: 'owner@ticketshow.com', phone: '+919876543212', password_hash: passwordHash, role_id: '33333333-3333-3333-3333-333333333333', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '40000000-4000-4000-4000-400000000000', full_name: 'Star Event Organizer', email: 'organizer@ticketshow.com', phone: '+919876543213', password_hash: passwordHash, role_id: '44444444-4444-4444-4444-444444444444', city_id: 'a2222222-2222-2222-2222-222222222222', status: 'active', email_verified: true, phone_verified: true }
    ];
    for (const u of demoUsers) {
      await User.create(u);
    }

    // 5. Seed Event Categories
    console.log('Seeding Event Categories...');
    const categories = [
      { id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Concert' },
      { id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Standup Comedy' },
      { id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Theatre Play' },
      { id: 'c4444444-4444-4444-4444-444444444444', category_name: 'Sports' },
      { id: 'c5555555-5555-5555-5555-555555555555', category_name: 'Music Festival' },
      { id: 'c6666666-6666-6666-6666-666666666666', category_name: 'Technology Summit' },
      { id: 'c7777777-7777-7777-7777-777777777777', category_name: 'College Events' },
      { id: 'c8888888-8888-8888-8888-888888888888', category_name: 'Workshops' }
    ];
    for (const cat of categories) {
      await EventCategory.create(cat);
    }

    // 6. Seed exactly 40 Movies
    console.log('Seeding 40 Movies...');
    const moviePosters = [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500',
      'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=500',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500'
    ];
    const movieBanners = [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1000',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000',
      'https://images.unsplash.com/photo-1500627869374-13cd993b1115?w=1000',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1000',
      'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=1000',
      'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=1000',
      'https://images.unsplash.com/photo-1542204172-e70528091867?w=1000',
      'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=1000',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000'
    ];

    const genresList = ['Action, Sci-Fi', 'Comedy, Romance', 'Thriller, Crime', 'Horror, Mystery', 'Drama, Family', 'Adventure, Fantasy'];
    const languagesList = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

    const moviesToCreate = [];
    for (let i = 1; i <= 40; i++) {
      const isComingSoon = i > 30;
      moviesToCreate.push({
        title: `Movie Blockbuster ${i}`,
        genre: genresList[i % genresList.length],
        duration: 90 + (i * 3) % 90,
        age_rating: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'U' : 'UA',
        language: languagesList[i % languagesList.length],
        release_date: isComingSoon ? '2026-09-15' : '2026-06-01',
        status: isComingSoon ? 'coming_soon' : 'now_showing',
        poster: moviePosters[i % moviePosters.length],
        banner: movieBanners[i % movieBanners.length],
        description: `This is the epic description for Blockbuster Movie ${i}. Featuring high production value, a stellar cast, and breathtaking visuals.`
      });
    }
    const seededMovies = await Movie.bulkCreate(moviesToCreate);
    console.log(`Seeded ${seededMovies.length} movies.`);

    // Seed Movie Cast members for first 10 movies
    console.log('Seeding movie cast entries...');
    const castsToCreate = [];
    for (let m = 0; m < 10; m++) {
      castsToCreate.push({
        movie_id: seededMovies[m].id,
        actor_name: `Famous Actor A${m}`,
        character_name: `Protagonist X${m}`,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
      castsToCreate.push({
        movie_id: seededMovies[m].id,
        actor_name: `Supporting Actor B${m}`,
        character_name: `Antagonist Y${m}`,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      });
    }
    await MovieCast.bulkCreate(castsToCreate);

    // 7. Seed exactly 30 Events
    console.log('Seeding 30 Events...');
    const eventTitles = [
      'A.R. Rahman Symphony Tour', 'Sunburn Arena DJ Snake', 'Zakir Khan Comedy Special', 'Vir Das Mind Fool Tour',
      'Mughal-E-Azam The Musical', 'Shakespeare Hamlet Live Play', 'IPL T20 Wankhede Match', 'Pro Kabaddi Tournament',
      'ISL Football Derby', 'Diljit Dosanjh Dil-Luminati Tour', 'Tech Innovation Summit 2026', 'AI Frontiers Workshop',
      'IIT Saarang Music Night', 'BITS Oasis College Fest', 'Kochi Biennale Arts Event', 'Mumbai Culinary Festival',
      'Bangalore Standup Special', 'Chennai Fusion Concert', 'Delhi Startup TechSummit', 'Hyderabad Sports Arena Match',
      'Salem Music Carnival', 'Kolkata Literature Fest', 'Pune Comedy Special', 'Trivandrum Classical Dance',
      'Coimbatore Food Expo', 'Erode Handloom Workshop', 'Thoothukudi Beach Sports', 'Vellore Tech Fest',
      'Mysore Palace Symphony', 'Visakhapatnam Arena concert'
    ];

    const categoryIds = [
      'c1111111-1111-1111-1111-111111111111', // Concert
      'c2222222-2222-2222-2222-222222222222', // Standup Comedy
      'c3333333-3333-3333-3333-333333333333', // Theatre Play
      'c4444444-4444-4444-4444-444444444444', // Sports
      'c5555555-5555-5555-5555-555555555555', // Music Festival
      'c6666666-6666-6666-6666-666666666666', // Technology Summit
      'c7777777-7777-7777-7777-777777777777', // College Events
      'c8888888-8888-8888-8888-888888888888'  // Workshops
    ];

    const eventsToCreate = [];
    for (let e = 1; e <= 30; e++) {
      const cityObj = cityList[e % cityList.length];
      eventsToCreate.push({
        organizer_id: '40000000-4000-4000-4000-400000000000',
        category_id: categoryIds[e % categoryIds.length],
        title: eventTitles[e - 1] || `Premium Event Tour ${e}`,
        description: `This is the epic description for ${eventTitles[e - 1] || 'Premium Event'}. Experience premium setups and absolute live engagement.`,
        venue: `Stadium Block ${e}, ${cityObj.city_name}`,
        city_id: cityObj.id,
        banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
        start_date: new Date('2026-09-01'),
        end_date: new Date('2026-09-01'),
        status: 'active'
      });
    }
    const seededEvents = await Event.bulkCreate(eventsToCreate);

    // Seed Event ticket pricing structures for all 30 events
    console.log('Seeding Event Tickets pricing...');
    const ticketsToCreate = [];
    for (const ev of seededEvents) {
      ticketsToCreate.push({
        event_id: ev.id,
        ticket_type: 'General Admission',
        price: 499.00,
        available_quantity: 400
      });
      ticketsToCreate.push({
        event_id: ev.id,
        ticket_type: 'VIP Pass',
        price: 1499.00,
        available_quantity: 100
      });
    }
    await EventTicket.bulkCreate(ticketsToCreate);

    // 8. Seed exactly 25 Theatres
    console.log('Seeding 25 Theatres...');
    const theatrePrefixes = ['PVR Cinema', 'Inox Multiplex', 'Cinemax', 'Carnival Cinemas', 'Miraj Cinemas'];
    const theatresToCreate = [];
    for (let t = 1; t <= 25; t++) {
      const cityObj = cityList[t % cityList.length];
      const descObj = JSON.stringify({
        facilities: 'Parking, Food Court, Wheelchair Access, Dolby Atmos Sound',
        gmapsLink: `https://www.google.com/maps?q=${19.0 + (t % 5) * 0.1},${72.0 + (t % 5) * 0.1}`,
        customDesc: `Luxurious cinema theater ${t} located in ${cityObj.city_name}.`
      });

      theatresToCreate.push({
        owner_id: '30000000-3000-3000-3000-300000000000',
        city_id: cityObj.id,
        theatre_name: `${theatrePrefixes[t % theatrePrefixes.length]} ${cityObj.city_name} (${t})`,
        address: `Main Road Mall, Area ${t}, ${cityObj.city_name}`,
        latitude: parseFloat((19.0 + (t % 5) * 0.1).toFixed(6)),
        longitude: parseFloat((72.0 + (t % 5) * 0.1).toFixed(6)),
        phone: `+9198765400${t}`,
        email: `theatre${t}@cinemamall.com`,
        description: descObj,
        status: 'active'
      });
    }
    const seededTheatres = await Theatre.bulkCreate(theatresToCreate);

    // Seed 2 Screens for each of the 25 Theatres (50 screens total)
    console.log('Seeding Screens & Seat Grids layout...');
    const screensToCreate = [];
    for (const th of seededTheatres) {
      screensToCreate.push({
        theatre_id: th.id,
        screen_name: 'Dolby Atmos Screen 1',
        capacity: 100,
        rows: 10,
        columns: 10
      });
      screensToCreate.push({
        theatre_id: th.id,
        screen_name: 'VIP Screen 2',
        capacity: 50,
        rows: 5,
        columns: 10
      });
    }
    const seededScreens = await Screen.bulkCreate(screensToCreate);

    // Seed seats for all screens (50 screens * average 75 seats = ~3750 seats)
    const seatsToCreate = [];
    for (const scr of seededScreens) {
      const isScreen1 = scr.screen_name.includes('Atmos');
      const rows = isScreen1 ? 10 : 5;
      const columns = 10;
      
      for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 1; c <= columns; c++) {
          seatsToCreate.push({
            screen_id: scr.id,
            seat_number: `${rowLetter}-${c}`,
            seat_type: r < 2 ? 'VIP' : r < 5 ? 'Premium' : 'Normal',
            price: r < 2 ? 300.00 : r < 5 ? 220.00 : 150.00
          });
        }
      }
    }
    console.log(`Bulk inserting ${seatsToCreate.length} seat layout configs...`);
    const seededSeats = await Seat.bulkCreate(seatsToCreate);

    // 9. Seed 150+ Shows
    console.log('Seeding 150+ Showtimes...');
    const nowShowing = seededMovies.filter(m => m.status === 'now_showing');
    const showsToCreate = [];
    const showTimings = [
      { start: '10:00:00', end: '13:00:00' },
      { start: '14:15:00', end: '17:15:00' },
      { start: '18:30:00', end: '21:30:00' },
      { start: '22:00:00', end: '01:00:00' }
    ];

    let showCounter = 1;
    // We have 50 screens. Schedule 4 shows on each screen (50 * 4 = 200 shows)
    for (const scr of seededScreens) {
      for (let tIdx = 0; tIdx < showTimings.length; tIdx++) {
        const timeSlot = showTimings[tIdx];
        const movie = nowShowing[showCounter % nowShowing.length];
        
        showsToCreate.push({
          movie_id: movie.id,
          screen_id: scr.id,
          show_date: '2026-07-19',
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          language: movie.language,
          format: tIdx % 2 === 0 ? '2D' : '3D',
          status: 'active'
        });
        showCounter++;
      }
    }
    const seededShows = await Show.bulkCreate(showsToCreate);
    console.log(`Seeded ${seededShows.length} showtimes.`);

    // 10. Seed Hundreds of Bookings
    console.log('Seeding hundreds of bookings & transactions logs...');
    const bookingsToCreate = [];
    const paymentsToCreate = [];

    // Create 180 bookings spread across the scheduled shows
    for (let b = 1; b <= 180; b++) {
      const show = seededShows[b % seededShows.length];
      const bookingNo = `BK-${String(Date.now()).slice(-5)}-${String(b).padStart(4, '0')}`;
      
      bookingsToCreate.push({
        booking_number: bookingNo,
        user_id: '20000000-2000-2000-2000-200000000000', // customer user id
        show_id: show.id,
        event_ticket_id: null,
        booking_date: new Date(`2026-07-18T10:${(b % 60).toString().padStart(2, '0')}:00Z`),
        total_amount: 360.00,
        discount: 0.00,
        booking_status: b % 10 === 0 ? 'cancelled' : 'confirmed',
        payment_status: b % 10 === 0 ? 'refunded' : 'paid',
        qr_code: `TICKET-${bookingNo}`
      });
    }

    const seededBookings = await Booking.bulkCreate(bookingsToCreate);
    
    // Seed Booking seats connections and payments
    const bookingSeatsToCreate = [];
    for (let idx = 0; idx < seededBookings.length; idx++) {
      const bookingObj = seededBookings[idx];
      
      // Find seats belonging to this show's screen
      const showObj = seededShows.find(s => s.id === bookingObj.show_id);
      const matchingSeats = seededSeats.filter(s => s.screen_id === showObj.screen_id);

      if (matchingSeats.length >= 2) {
        bookingSeatsToCreate.push({
          booking_id: bookingObj.id,
          seat_id: matchingSeats[0].id,
          price: 180.00
        });
        bookingSeatsToCreate.push({
          booking_id: bookingObj.id,
          seat_id: matchingSeats[1].id,
          price: 180.00
        });
      }

      paymentsToCreate.push({
        booking_id: bookingObj.id,
        transaction_id: `TXN-${bookingObj.booking_number}`,
        gateway: 'stripe',
        payment_method: 'card',
        amount: 360.00,
        status: bookingObj.booking_status === 'cancelled' ? 'refunded' : 'success',
        paid_at: new Date()
      });
    }

    await BookingSeat.bulkCreate(bookingSeatsToCreate);
    await Payment.bulkCreate(paymentsToCreate);
    console.log(`Seeded ${seededBookings.length} booking transactions.`);

    // 11. Seed Reviews & Notifications
    console.log('Seeding coupons, reviews, and notifications...');
    const couponsData = [
      { coupon_code: 'WELCOME50', discount_type: 'percentage', discount_value: 50.00, minimum_amount: 200.00, usage_limit: 500, expiry_date: '2027-01-01', status: 'active' },
      { coupon_code: 'FLAT100', discount_type: 'flat', discount_value: 100.00, minimum_amount: 400.00, usage_limit: 200, expiry_date: '2027-01-01', status: 'active' },
      { coupon_code: 'GOLDEN20', discount_type: 'percentage', discount_value: 20.00, minimum_amount: 150.00, usage_limit: 1000, expiry_date: '2027-01-01', status: 'active' }
    ];
    for (const c of couponsData) {
      await Coupon.create(c);
    }

    const reviewsToCreate = [];
    for (let r = 0; r < 20; r++) {
      reviewsToCreate.push({
        movie_id: seededMovies[r % seededMovies.length].id,
        user_id: '20000000-2000-2000-2000-200000000000',
        rating: 9,
        review: `Phenomenal performance and sound graphics. An absolute masterwork, loved it!`
      });
    }
    await Review.bulkCreate(reviewsToCreate);

    const notificationsToCreate = [];
    for (let n = 1; n <= 15; n++) {
      notificationsToCreate.push({
        user_id: '20000000-2000-2000-2000-200000000000',
        title: `Offer Alert ${n}`,
        message: `Hurry! Get flat discounts on your next movie booking using code FLAT100.`,
        type: 'promotion',
        read_status: false
      });
    }
    await Notification.bulkCreate(notificationsToCreate);

    console.log('MASSIVE ENTERPRISE-GRADE DEMO SEED COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error during data seeding:', err);
    process.exit(1);
  }
};

seedData();

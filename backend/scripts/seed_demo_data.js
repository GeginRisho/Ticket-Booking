const { 
  sequelize, City, Movie, MovieCast, EventCategory, 
  Event, EventTicket, Theatre, Screen, Seat, Show, 
  Coupon, Review, Notification, Role, User, Booking, BookingSeat, Payment 
} = require('../models');
const bcrypt = require('bcrypt');

const seedData = async () => {
  console.log('Starting massive enterprise-quality idempotent demo data seeding...');
  
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'Admin' },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'Customer' },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'Theatre Owner' },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'Event Organizer' },
      { id: '55555555-5555-5555-5555-555555555555', role_name: 'Super Admin' }
    ];
    for (const r of roles) {
      await Role.findOrCreate({ where: { id: r.id }, defaults: r });
    }

    // 2. Seed 20+ Cities
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
      await City.findOrCreate({ where: { id: c.id }, defaults: c });
    }

    // 3. Seed Users with precise passwords
    console.log('Seeding demo users...');
    const hashAdmin = await bcrypt.hash('Admin@123', 12);
    const hashOwner = await bcrypt.hash('Owner@123', 12);
    const hashCustomer = await bcrypt.hash('Customer@123', 12);

    const demoUsers = [
      { id: '50000000-5000-5000-5000-500000000000', full_name: 'Platform Super Admin', email: 'superadmin@ticketshow.com', phone: '+919876543209', password_hash: hashAdmin, role_id: '55555555-5555-5555-5555-555555555555', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '10000000-1000-1000-1000-100000000000', full_name: 'Platform Admin', email: 'admin@ticketshow.com', phone: '+919876543210', password_hash: hashAdmin, role_id: '11111111-1111-1111-1111-111111111111', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '20000000-2000-2000-2000-200000000000', full_name: 'John Customer', email: 'customer@ticketshow.com', phone: '+919876543211', password_hash: hashCustomer, role_id: '22222222-2222-2222-2222-222222222222', city_id: 'a3333333-3333-3333-3333-333333333333', status: 'active', email_verified: true, phone_verified: true },
      { id: '30000000-3000-3000-3000-300000000000', full_name: 'Rex Theatre Owner', email: 'owner@ticketshow.com', phone: '+919876543212', password_hash: hashOwner, role_id: '33333333-3333-3333-3333-333333333333', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '40000000-4000-4000-4000-400000000000', full_name: 'Star Event Organizer', email: 'organizer@ticketshow.com', phone: '+919876543213', password_hash: hashCustomer, role_id: '44444444-4444-4444-4444-444444444444', city_id: 'a2222222-2222-2222-2222-222222222222', status: 'active', email_verified: true, phone_verified: true }
    ];

    for (const u of demoUsers) {
      const [user, created] = await User.findOrCreate({ where: { email: u.email }, defaults: u });
      if (!created) {
        await user.update({
          password_hash: u.password_hash,
          role_id: u.role_id,
          status: 'active'
        });
      }
    }

    // 4. Seed Event Categories
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
      await EventCategory.findOrCreate({ where: { id: cat.id }, defaults: cat });
    }

    // 5. Seed exactly 40 Movies
    console.log('Seeding 40 Movies...');
    const moviePosters = [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
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

    const seededMovies = [];
    for (let i = 1; i <= 40; i++) {
      const isComingSoon = i > 30;
      const movieId = `f0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`;
      const mData = {
        id: movieId,
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
      };
      const [movie, created] = await Movie.findOrCreate({ where: { id: movieId }, defaults: mData });
      seededMovies.push(movie);
    }
    console.log(`Seeded/verified ${seededMovies.length} movies.`);

    // Movie cast seeding
    for (let m = 0; m < 10; m++) {
      const movie_id = seededMovies[m].id;
      
      const cast1 = {
        movie_id,
        actor_name: `Famous Actor A${m}`,
        character_name: `Protagonist X${m}`,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      await MovieCast.findOrCreate({ 
        where: { movie_id, actor_name: cast1.actor_name }, 
        defaults: cast1 
      });

      const cast2 = {
        movie_id,
        actor_name: `Supporting Actor B${m}`,
        character_name: `Antagonist Y${m}`,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      };
      await MovieCast.findOrCreate({ 
        where: { movie_id, actor_name: cast2.actor_name }, 
        defaults: cast2 
      });
    }

    // 6. Seed exactly 30 Events
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
      'c1111111-1111-1111-1111-111111111111',
      'c2222222-2222-2222-2222-222222222222',
      'c3333333-3333-3333-3333-333333333333',
      'c4444444-4444-4444-4444-444444444444',
      'c5555555-5555-5555-5555-555555555555',
      'c6666666-6666-6666-6666-666666666666',
      'c7777777-7777-7777-7777-777777777777',
      'c8888888-8888-8888-8888-888888888888'
    ];

    const seededEvents = [];
    for (let e = 1; e <= 30; e++) {
      const cityObj = cityList[e % cityList.length];
      const eventId = `e0000000-0000-0000-0000-${e.toString().padStart(12, '0')}`;
      const eData = {
        id: eventId,
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
      };
      const [event, created] = await Event.findOrCreate({ where: { id: eventId }, defaults: eData });
      seededEvents.push(event);
    }

    // Seed Event Tickets
    for (const ev of seededEvents) {
      await EventTicket.findOrCreate({
        where: { event_id: ev.id, ticket_type: 'General Admission' },
        defaults: {
          event_id: ev.id,
          ticket_type: 'General Admission',
          price: 499.00,
          available_quantity: 400
        }
      });
      await EventTicket.findOrCreate({
        where: { event_id: ev.id, ticket_type: 'VIP Pass' },
        defaults: {
          event_id: ev.id,
          ticket_type: 'VIP Pass',
          price: 1499.00,
          available_quantity: 100
        }
      });
    }

    // 7. Seed exactly 25 Theatres
    console.log('Seeding 25 Theatres...');
    const theatrePrefixes = ['PVR Cinema', 'Inox Multiplex', 'Cinemax', 'Carnival Cinemas', 'Miraj Cinemas'];
    const seededTheatres = [];
    for (let t = 1; t <= 25; t++) {
      const cityObj = cityList[t % cityList.length];
      const theatreId = `d0000000-0000-0000-0000-${t.toString().padStart(12, '0')}`;
      const descObj = JSON.stringify({
        facilities: 'Parking, Food Court, Wheelchair Access, Dolby Atmos Sound',
        gmapsLink: `https://www.google.com/maps?q=${19.0 + (t % 5) * 0.1},${72.0 + (t % 5) * 0.1}`,
        customDesc: `Luxurious cinema theater ${t} located in ${cityObj.city_name}.`
      });

      const tData = {
        id: theatreId,
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
      };
      const [theatre, created] = await Theatre.findOrCreate({ where: { id: theatreId }, defaults: tData });
      seededTheatres.push(theatre);
    }

    // Seed 2 Screens for each theatre
    const seededScreens = [];
    for (const th of seededTheatres) {
      const screenId1 = `${th.id.slice(0, 18)}-0100-${th.id.slice(24)}`;
      const screenId2 = `${th.id.slice(0, 18)}-0200-${th.id.slice(24)}`;
      
      const sData1 = {
        id: screenId1,
        theatre_id: th.id,
        screen_name: 'Dolby Atmos Screen 1',
        capacity: 100,
        rows: 10,
        columns: 10
      };
      const [scr1, c1] = await Screen.findOrCreate({ where: { id: screenId1 }, defaults: sData1 });
      seededScreens.push(scr1);

      const sData2 = {
        id: screenId2,
        theatre_id: th.id,
        screen_name: 'VIP Screen 2',
        capacity: 50,
        rows: 5,
        columns: 10
      };
      const [scr2, c2] = await Screen.findOrCreate({ where: { id: screenId2 }, defaults: sData2 });
      seededScreens.push(scr2);
    }

    // Seed seat layout grids
    console.log('Checking seat configurations...');
    for (const scr of seededScreens) {
      const seatCount = await Seat.count({ where: { screen_id: scr.id } });
      if (seatCount === 0) {
        const seatsToCreate = [];
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
        await Seat.bulkCreate(seatsToCreate);
      }
    }

    // 8. Seed exactly 200 Shows
    console.log('Seeding 200 Showtimes...');
    const nowShowing = seededMovies.filter(m => m.status === 'now_showing');
    const seededShows = [];
    const showTimings = [
      { start: '10:00:00', end: '13:00:00' },
      { start: '14:15:00', end: '17:15:00' },
      { start: '18:30:00', end: '21:30:00' },
      { start: '22:00:00', end: '01:00:00' }
    ];

    let showCounter = 1;
    for (const scr of seededScreens) {
      for (let tIdx = 0; tIdx < showTimings.length; tIdx++) {
        const timeSlot = showTimings[tIdx];
        const movie = nowShowing[showCounter % nowShowing.length];
        const showId = `80000000-0000-0000-0000-${showCounter.toString().padStart(12, '0')}`;
        
        const showData = {
          id: showId,
          movie_id: movie.id,
          screen_id: scr.id,
          show_date: '2026-07-19',
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          language: movie.language,
          format: tIdx % 2 === 0 ? '2D' : '3D',
          status: 'active'
        };
        const [show, created] = await Show.findOrCreate({ where: { id: showId }, defaults: showData });
        seededShows.push(show);
        showCounter++;
      }
    }

    // 9. Seed 1000 Bookings deterministically
    console.log('Seeding 1000 bookings...');
    const bookingCount = await Booking.count();
    if (bookingCount < 1000) {
      const bookingsToCreate = [];
      const paymentsToCreate = [];
      const bookingSeatsToCreate = [];
      
      const allSeats = await Seat.findAll();
      const targetCount = 1000 - bookingCount;
      console.log(`Seeding ${targetCount} new bookings...`);

      for (let b = 1; b <= targetCount; b++) {
        const show = seededShows[b % seededShows.length];
        const bookingId = `90000000-0000-0000-0000-${(bookingCount + b).toString().padStart(12, '0')}`;
        const bookingNo = `BK-SEED-${(bookingCount + b).toString().padStart(6, '0')}`;
        
        bookingsToCreate.push({
          id: bookingId,
          booking_number: bookingNo,
          user_id: '20000000-2000-2000-2000-200000000000',
          show_id: show.id,
          booking_date: new Date(`2026-07-18T10:${(b % 60).toString().padStart(2, '0')}:00Z`),
          total_amount: 360.00,
          discount: 0.00,
          booking_status: b % 15 === 0 ? 'cancelled' : 'confirmed',
          payment_status: b % 15 === 0 ? 'refunded' : 'paid',
          qr_code: `TICKET-${bookingNo}`
        });

        paymentsToCreate.push({
          booking_id: bookingId,
          transaction_id: `TXN-${bookingNo}`,
          gateway: 'stripe',
          payment_method: 'card',
          amount: 360.00,
          status: b % 15 === 0 ? 'refunded' : 'success',
          paid_at: new Date()
        });

        const matchingSeats = allSeats.filter(s => s.screen_id === show.screen_id);
        if (matchingSeats.length >= 2) {
          bookingSeatsToCreate.push({
            booking_id: bookingId,
            seat_id: matchingSeats[0].id,
            price: 180.00
          });
          bookingSeatsToCreate.push({
            booking_id: bookingId,
            seat_id: matchingSeats[1].id,
            price: 180.00
          });
        }
      }

      const chunkSize = 200;
      for (let i = 0; i < bookingsToCreate.length; i += chunkSize) {
        await Booking.bulkCreate(bookingsToCreate.slice(i, i + chunkSize));
        await Payment.bulkCreate(paymentsToCreate.slice(i, i + chunkSize));
      }
      for (let i = 0; i < bookingSeatsToCreate.length; i += chunkSize) {
        await BookingSeat.bulkCreate(bookingSeatsToCreate.slice(i, i + chunkSize));
      }
    }

    // 10. Seed coupons & reviews
    console.log('Seeding coupons, reviews, and notifications...');
    const couponsData = [
      { id: '70000000-0000-0000-0000-000000000001', coupon_code: 'WELCOME50', discount_type: 'percentage', discount_value: 50.00, minimum_amount: 200.00, usage_limit: 500, expiry_date: '2027-01-01', status: 'active' },
      { id: '70000000-0000-0000-0000-000000000002', coupon_code: 'FLAT100', discount_type: 'flat', discount_value: 100.00, minimum_amount: 400.00, usage_limit: 200, expiry_date: '2027-01-01', status: 'active' },
      { id: '70000000-0000-0000-0000-000000000003', coupon_code: 'GOLDEN20', discount_type: 'percentage', discount_value: 20.00, minimum_amount: 150.00, usage_limit: 1000, expiry_date: '2027-01-01', status: 'active' }
    ];
    for (const c of couponsData) {
      await Coupon.findOrCreate({ where: { coupon_code: c.coupon_code }, defaults: c });
    }

    const reviewCount = await Review.count();
    if (reviewCount < 40) {
      const reviewsToCreate = [];
      for (let r = 1; r <= 40; r++) {
        reviewsToCreate.push({
          movie_id: seededMovies[r % seededMovies.length].id,
          user_id: '20000000-2000-2000-2000-200000000000',
          rating: 9,
          review: `Phenomenal performance and sound graphics. An absolute masterwork, loved it!`
        });
      }
      await Review.bulkCreate(reviewsToCreate);
    }

    const notifCount = await Notification.count();
    if (notifCount < 15) {
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
    }

    console.log('MASSIVE ENTERPRISE-GRADE DETERMINISTIC DEMO SEED COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error during data seeding:', err);
    process.exit(1);
  }
};

seedData();

const { 
  sequelize, City, Movie, MovieCast, EventCategory, 
  Event, EventTicket, Theatre, Screen, Seat, Show, 
  Coupon, Review, Notification, Role, User, Booking, BookingSeat, Payment, Venue
} = require('../models');
const bcrypt = require('bcrypt');

const seedData = async () => {
  console.log('Starting enterprise-quality demo data seeding with expanded event/organizer workspace layouts...');
  
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'admin' },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'customer' },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'theatre_owner' },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'event_organizer' },
      { id: '55555555-5555-5555-5555-555555555555', role_name: 'super_admin' }
    ];
    for (const r of roles) {
      await Role.upsert(r);
    }

    // 2. Seed Cities
    console.log('Seeding cities...');
    const cityList = [
      { id: 'a1111111-1111-1111-1111-111111111111', city_name: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'active' },
      { id: 'a2222222-2222-2222-2222-222222222222', city_name: 'Delhi', state: 'Delhi', country: 'India', status: 'active' },
      { id: 'a3333333-3333-3333-3333-333333333333', city_name: 'Bangalore', state: 'Karnataka', country: 'India', status: 'active' },
      { id: 'a4444444-4444-4444-4444-444444444444', city_name: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'active' },
      { id: 'a5555555-5555-5555-5555-555555555555', city_name: 'Hyderabad', state: 'Telangana', country: 'India', status: 'active' },
      { id: 'a6666666-6666-6666-6666-666666666666', city_name: 'Kolkata', state: 'West Bengal', country: 'India', status: 'active' },
      { id: 'a7777777-7777-7777-7777-777777777777', city_name: 'Pune', state: 'Maharashtra', country: 'India', status: 'active' },
      
      // Kerala & Andhra Pradesh
      { id: 'b7777777-7777-7777-7777-777777777777', city_name: 'Kochi', state: 'Kerala', country: 'India', status: 'active' },
      { id: 'b8888888-8888-8888-8888-888888888888', city_name: 'Trivandrum', state: 'Kerala', country: 'India', status: 'active' },
      { id: 'c1111111-2222-3333-4444-555555555555', city_name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', status: 'active' },

      // All remaining states and UTs in India (36 total states and UTs supported)
      { id: 'c0000001-0000-0000-0000-000000000001', city_name: 'Itanagar', state: 'Arunachal Pradesh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000002', city_name: 'Guwahati', state: 'Assam', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000003', city_name: 'Patna', state: 'Bihar', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000004', city_name: 'Raipur', state: 'Chhattisgarh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000005', city_name: 'Panaji', state: 'Goa', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000006', city_name: 'Ahmedabad', state: 'Gujarat', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000007', city_name: 'Gurgaon', state: 'Haryana', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000008', city_name: 'Shimla', state: 'Himachal Pradesh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000009', city_name: 'Ranchi', state: 'Jharkhand', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000010', city_name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000011', city_name: 'Imphal', state: 'Manipur', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000012', city_name: 'Shillong', state: 'Meghalaya', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000013', city_name: 'Aizawl', state: 'Mizoram', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000014', city_name: 'Kohima', state: 'Nagaland', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000015', city_name: 'Bhubaneswar', state: 'Odisha', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000016', city_name: 'Amritsar', state: 'Punjab', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000017', city_name: 'Jaipur', state: 'Rajasthan', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000018', city_name: 'Gangtok', state: 'Sikkim', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000019', city_name: 'Agartala', state: 'Tripura', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000020', city_name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000021', city_name: 'Dehradun', state: 'Uttarakhand', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000022', city_name: 'Port Blair', state: 'Andaman & Nicobar Islands', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000023', city_name: 'Chandigarh', state: 'Chandigarh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000024', city_name: 'Silvassa', state: 'Dadra & Nagar Haveli and Daman & Diu', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000025', city_name: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000026', city_name: 'Leh', state: 'Ladakh', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000027', city_name: 'Kavaratti', state: 'Lakshadweep', country: 'India', status: 'active' },
      { id: 'c0000001-0000-0000-0000-000000000028', city_name: 'Puducherry', state: 'Puducherry', country: 'India', status: 'active' }
    ];
    for (const c of cityList) {
      await City.findOrCreate({ where: { id: c.id }, defaults: c });
    }

    // 3. Seed Users with precise required passwords
    console.log('Seeding demo user accounts...');
    const hashSuperAdmin = await bcrypt.hash('Admin@123', 12);
    const hashAdmin = await bcrypt.hash('Admin@123', 12);
    const hashOwner = await bcrypt.hash('Owner@123', 12);
    const hashCustomer = await bcrypt.hash('Customer@123', 12);
    const hashOrganizer = await bcrypt.hash('Organizer@123', 12);

    const demoUsers = [
      { id: '50000000-5000-5000-5000-500000000000', full_name: 'Platform Super Admin', email: 'superadmin@ticketshow.com', phone: '+919876543209', password_hash: hashSuperAdmin, role_id: '55555555-5555-5555-5555-555555555555', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '10000000-1000-1000-1000-100000000000', full_name: 'Platform Admin', email: 'admin@ticketshow.com', phone: '+919876543210', password_hash: hashAdmin, role_id: '11111111-1111-1111-1111-111111111111', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
      { id: '20000000-2000-2000-2000-200000000000', full_name: 'John Customer', email: 'customer@ticketshow.com', phone: '+919876543211', password_hash: hashCustomer, role_id: '22222222-2222-2222-2222-222222222222', city_id: 'a3333333-3333-3333-3333-333333333333', status: 'active', email_verified: true, phone_verified: true },
      { id: '30000000-3000-3000-3000-300000000000', full_name: 'Rex Theatre Owner', email: 'owner@ticketshow.com', phone: '+919876543212', password_hash: hashOwner, role_id: '33333333-3333-3333-3333-333333333333', city_id: 'a1111111-1111-1111-1111-111111111111', status: 'active', email_verified: true, phone_verified: true },
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
        company_name: 'Showstar Entertainment Pvt Ltd',
        company_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        organizer_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        address: 'Penthouse A, Skyline Tech Park, Bangalore',
        business_details: 'Prominent events agency specialing in concerts and college festivals.',
        bank_account: 'HDFC Bank - 501002239401',
        gst_number: '27AABCU9603R1ZN',
        pan_number: 'AABCU9603R',
        business_license: 'LIC-2026-ORGANIZER',
        social_media_links: 'https://linkedin.com/company/showstar-events'
      }
    ];

    for (const u of demoUsers) {
      const [user, created] = await User.findOrCreate({ where: { email: u.email }, defaults: u });
      if (!created) {
        await user.update({
          password_hash: u.password_hash,
          role_id: u.role_id,
          status: 'active',
          company_name: u.company_name,
          company_logo: u.company_logo,
          organizer_photo: u.organizer_photo,
          address: u.address,
          business_details: u.business_details,
          bank_account: u.bank_account,
          gst_number: u.gst_number,
          pan_number: u.pan_number,
          business_license: u.business_license,
          social_media_links: u.social_media_links
        });
      }
    }

    // 4. Seed Physical Venues
    console.log('Seeding physical venues...');
    const demoVenues = [];
    for (let i = 0; i < cityList.length; i++) {
      const cityObj = cityList[i];
      const venueId = `00000000-0000-0000-0000-${(i + 1).toString().padStart(12, '0')}`;
      const v = {
        id: venueId,
        organizer_id: '40000000-4000-4000-4000-400000000000',
        city_id: cityObj.id,
        name: `${cityObj.city_name} Convention Center`,
        address: `Convention Boulevard, ${cityObj.city_name}`,
        seating_capacity: 500 + (i * 50),
        maps_location: `https://maps.google.com/?q=${cityObj.city_name}+Convention+Center`,
        parking_information: 'Valet & self parking available',
        contact_number: `+9199887766${i.toString().padStart(2, '0')}`,
        gallery_images: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500']
      };
      const [venue, created] = await Venue.findOrCreate({ where: { id: v.id }, defaults: v });
      if (!created) {
        await venue.update(v);
      }
      demoVenues.push(venue);
    }

    // 5. Seed Event Categories
    console.log('Seeding Event Categories...');
    const categories = [
      { id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Concert' },
      { id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Standup Comedy' },
      { id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Theatre Play' }
    ];
    for (const cat of categories) {
      await EventCategory.findOrCreate({ where: { id: cat.id }, defaults: cat });
    }

    // 6. Seed exactly 45 Events
    console.log('Seeding 45 Events...');
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
      'c3333333-3333-3333-3333-333333333333'
    ];

    const seatingLayout = {
      sections: [
        { name: 'VIP Zone', rows: ['A', 'B'], seatsPerRow: 10, price: 1499.00 },
        { name: 'Premium Zone', rows: ['C', 'D', 'E'], seatsPerRow: 10, price: 999.00 },
        { name: 'General Zone', rows: ['F', 'G', 'H', 'I', 'J'], seatsPerRow: 10, price: 499.00 }
      ]
    };

    const mediaLinks = {
      banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000',
      poster: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
      gallery: [
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
        'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=500'
      ],
      videos: ['https://www.w3schools.com/html/mov_bbb.mp4'],
      sponsors: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200']
    };

    const refundPolicyDetails = {
      cancellation_deadline: 24,
      refund_percentage: 100,
      non_refundable: false,
      automatic_refund: true
    };

    const seededEvents = [];
    for (let e = 1; e <= 45; e++) {
      const cityObj = cityList[e % cityList.length];
      const eventId = `e0000000-0000-0000-0000-${e.toString().padStart(12, '0')}`;
      const venueObj = demoVenues.find(v => v.city_id === cityObj.id) || demoVenues[0];

      const eData = {
        id: eventId,
        organizer_id: '40000000-4000-4000-4000-400000000000',
        category_id: categoryIds[e % categoryIds.length],
        title: eventTitles[(e - 1) % eventTitles.length] || `Premium Event Tour ${e}`,
        description: `This is the epic description for ${eventTitles[(e - 1) % eventTitles.length] || 'Premium Event'}. Experience premium setups and absolute live engagement.`,
        venue: venueObj.name,
        venue_id: venueObj.id,
        city_id: cityObj.id,
        banner: mediaLinks.banner,
        start_date: new Date('2026-09-01'),
        end_date: new Date('2026-09-01'),
        time: '18:00',
        capacity: venueObj.seating_capacity,
        age_restriction: 'All Ages',
        languages: ['English', 'Hindi'],
        tags: ['concert', 'live', 'music'],
        status: e % 3 === 0 ? 'published' : 'active', // Some pre-published events
        has_reserved_seating: e % 2 === 0, // Alternate seating layouts
        seating_layout: e % 2 === 0 ? seatingLayout : null,
        media_links: mediaLinks,
        refund_policy_details: refundPolicyDetails
      };
      
      const [event, created] = await Event.findOrCreate({ where: { id: eventId }, defaults: eData });
      if (!created) {
        await event.update(eData);
      }
      seededEvents.push(event);
    }

    // Seed Event Tickets
    console.log('Seeding event ticket categories...');
    const seededTicketCategories = [];
    for (const ev of seededEvents) {
      if (ev.has_reserved_seating) {
        const vipTc = await EventTicket.findOrCreate({
          where: { event_id: ev.id, ticket_type: 'VIP Zone' },
          defaults: { event_id: ev.id, ticket_type: 'VIP Zone', price: 1499.00, available_quantity: 20, booking_limit: 5, refund_policy: 'Refundable up to 24h prior' }
        });
        const premTc = await EventTicket.findOrCreate({
          where: { event_id: ev.id, ticket_type: 'Premium Zone' },
          defaults: { event_id: ev.id, ticket_type: 'Premium Zone', price: 999.00, available_quantity: 36, booking_limit: 5, refund_policy: 'Refundable up to 24h prior' }
        });
        seededTicketCategories.push(vipTc[0], premTc[0]);
      } else {
        const gaTc = await EventTicket.findOrCreate({
          where: { event_id: ev.id, ticket_type: 'General Admission' },
          defaults: { event_id: ev.id, ticket_type: 'General Admission', price: 499.00, available_quantity: 400, booking_limit: 10, refund_policy: 'Refundable up to 24h prior' }
        });
        seededTicketCategories.push(gaTc[0]);
      }
    }

    // 7. Seed exactly 40 Movies
    console.log('Seeding 40 Movies...');
    const moviePosters = [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500'
    ];
    const movieBanners = [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1000'
    ];

    const genresList = ['Action, Sci-Fi', 'Comedy, Romance', 'Thriller, Crime', 'Drama, Family'];
    const languagesList = ['English', 'Hindi', 'Tamil', 'Telugu'];

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

    // Seeding cast
    for (let m = 0; m < 5; m++) {
      const movie_id = seededMovies[m].id;
      const cast1 = {
        movie_id,
        actor_name: `Famous Actor A${m}`,
        character_name: `Protagonist X${m}`,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      await MovieCast.findOrCreate({ where: { movie_id, actor_name: cast1.actor_name }, defaults: cast1 });
    }

    // 8. Seed exactly 45 Theatres
    console.log('Seeding 45 Theatres...');
    const theatrePrefixes = ['PVR Cinema', 'Inox Multiplex', 'Cinemax', 'Carnival Cinemas', 'Miraj Cinemas'];
    const seededTheatres = [];
    for (let t = 1; t <= 45; t++) {
      const cityObj = cityList[t % cityList.length];
      const theatreId = `d0000000-0000-0000-0000-${t.toString().padStart(12, '0')}`;
      const descObj = JSON.stringify({
        facilities: 'Parking, Food Court, Dolby Atmos Sound',
        gmapsLink: `https://www.google.com/maps?q=12.97,77.59`,
        customDesc: `Luxurious cinema theater ${t} located in ${cityObj.city_name}.`
      });

      const tData = {
        id: theatreId,
        owner_id: '30000000-3000-3000-3000-300000000000',
        city_id: cityObj.id,
        theatre_name: `${theatrePrefixes[t % theatrePrefixes.length]} ${cityObj.city_name} (${t})`,
        address: `Main Road Mall, Area ${t}, ${cityObj.city_name}`,
        latitude: 12.97,
        longitude: 77.59,
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
      
      const sData1 = { id: screenId1, theatre_id: th.id, screen_name: 'Dolby Atmos Screen 1', capacity: 100, rows: 10, columns: 10 };
      const [scr1, c1] = await Screen.findOrCreate({ where: { id: screenId1 }, defaults: sData1 });
      seededScreens.push(scr1);

      const sData2 = { id: screenId2, theatre_id: th.id, screen_name: 'VIP Screen 2', capacity: 50, rows: 5, columns: 10 };
      const [scr2, c2] = await Screen.findOrCreate({ where: { id: screenId2 }, defaults: sData2 });
      seededScreens.push(scr2);
    }

    // Seed seats
    console.log('Seeding theatre seat configurations...');
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

    // 9. Seed exactly 200 Shows
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
    const baseDate = new Date();
    for (const scr of seededScreens) {
      for (let tIdx = 0; tIdx < showTimings.length; tIdx++) {
        const timeSlot = showTimings[tIdx];
        const movie = nowShowing[showCounter % nowShowing.length];
        const showId = `80000000-0000-0000-0000-${showCounter.toString().padStart(12, '0')}`;
        
        const showDateObj = new Date(baseDate);
        showDateObj.setDate(baseDate.getDate() + (showCounter % 7));
        const showDateStr = showDateObj.toISOString().split('T')[0];

        const showData = {
          id: showId,
          movie_id: movie.id,
          screen_id: scr.id,
          show_date: showDateStr,
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          language: movie.language,
          format: tIdx % 2 === 0 ? '2D' : '3D',
          status: 'active'
        };
        const [show, created] = await Show.findOrCreate({ where: { id: showId }, defaults: showData });
        if (!created) {
          await show.update({ show_date: showDateStr });
        }
        seededShows.push(show);
        showCounter++;
      }
    }

    // 10. Seed 1000 Bookings deterministically (Including Events)
    console.log('Seeding 1000 bookings logs...');
    const bookingCount = await Booking.count();
    if (bookingCount < 1000) {
      const bookingsToCreate = [];
      const paymentsToCreate = [];
      const bookingSeatsToCreate = [];
      
      const allSeats = await Seat.findAll();
      const targetCount = 1000 - bookingCount;
      console.log(`Generating ${targetCount} bookings transactions...`);

      for (let b = 1; b <= targetCount; b++) {
        const bookingId = `90000000-0000-0000-0000-${(bookingCount + b).toString().padStart(12, '0')}`;
        
        // 90% Movie Bookings, 10% Event Bookings for rich dashboards
        if (b % 10 === 0) {
          const ticketCategory = seededTicketCategories[b % seededTicketCategories.length];
          const bookingNo = `EV-SEED-${(bookingCount + b).toString().padStart(6, '0')}`;
          const isReserved = ticketCategory.ticket_type.includes('Zone');
          
          bookingsToCreate.push({
            id: bookingId,
            booking_number: bookingNo,
            user_id: '20000000-2000-2000-2000-200000000000',
            show_id: null,
            event_ticket_id: ticketCategory.id,
            booking_date: new Date(`2026-07-19T11:${(b % 60).toString().padStart(2, '0')}:00Z`),
            total_amount: parseFloat(ticketCategory.price) * 2,
            discount: 0.00,
            booking_status: b % 15 === 0 ? 'cancelled' : 'confirmed',
            payment_status: b % 15 === 0 ? 'refunded' : 'paid',
            qr_code: `TICKET-${bookingNo}`,
            booked_seats: isReserved ? ['VIP-A-1', 'VIP-A-2'] : null
          });

          paymentsToCreate.push({
            booking_id: bookingId,
            transaction_id: `TXN-${bookingNo}`,
            gateway: 'razorpay',
            payment_method: 'upi',
            amount: parseFloat(ticketCategory.price) * 2,
            status: b % 15 === 0 ? 'refunded' : 'success',
            paid_at: new Date()
          });
        } else {
          const show = seededShows[b % seededShows.length];
          const bookingNo = `BK-SEED-${(bookingCount + b).toString().padStart(6, '0')}`;
          
          bookingsToCreate.push({
            id: bookingId,
            booking_number: bookingNo,
            user_id: '20000000-2000-2000-2000-200000000000',
            show_id: show.id,
            event_ticket_id: null,
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

    // 11. Seed coupons
    console.log('Seeding coupons, reviews, and notifications...');
    const couponsData = [
      { id: '70000000-0000-0000-0000-000000000001', coupon_code: 'WELCOME50', discount_type: 'percentage', discount_value: 50.00, minimum_amount: 200.00, usage_limit: 500, expiry_date: '2027-01-01', status: 'active', start_date: '2026-01-01' },
      { id: '70000000-0000-0000-0000-000000000002', coupon_code: 'FLAT100', discount_type: 'flat', discount_value: 100.00, minimum_amount: 400.00, usage_limit: 200, expiry_date: '2027-01-01', status: 'active', start_date: '2026-01-01' },
      { 
        id: '70000000-0000-0000-0000-000000000003', 
        coupon_code: 'EARLYBIRD', 
        discount_type: 'percentage', 
        discount_value: 20.00, 
        minimum_amount: 150.00, 
        usage_limit: 1000, 
        expiry_date: '2027-01-01', 
        status: 'active', 
        start_date: '2026-01-01',
        event_id: 'e0000000-0000-0000-0000-000000000001', // Linked to Rahman tour
        applicable_categories: ['VIP Pass', 'VIP Zone'],
        group_discount_size: 1
      },
      {
        id: '70000000-0000-0000-0000-000000000004',
        coupon_code: 'GROUP3',
        discount_type: 'percentage',
        discount_value: 15.00,
        minimum_amount: 100.00,
        usage_limit: 500,
        expiry_date: '2027-01-01',
        status: 'active',
        start_date: '2026-01-01',
        group_discount_size: 3 // Min 3 tickets
      }
    ];
    for (const c of couponsData) {
      const existing = await Coupon.findOne({ where: { coupon_code: c.coupon_code } });
      if (!existing) {
        await Coupon.create(c);
      } else {
        await existing.update(c);
      }
    }

    // Seed Reviews
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

    // Seed Notifications
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

    console.log('ENTERPRISE DEMO SEED WITH DETAILED EVENTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error during data seeding:', err);
    process.exit(1);
  }
};

seedData();

const sequelize = require('../config/database');
const Role = require('./Role');
const City = require('./City');
const User = require('./User');
const Movie = require('./Movie');
const MovieCast = require('./MovieCast');
const Theatre = require('./Theatre');
const Screen = require('./Screen');
const Seat = require('./Seat');
const Show = require('./Show');
const Booking = require('./Booking');
const BookingSeat = require('./BookingSeat');
const Payment = require('./Payment');
const Refund = require('./Refund');
const Event = require('./Event');
const EventCategory = require('./EventCategory');
const EventTicket = require('./EventTicket');
const Wishlist = require('./Wishlist');
const Review = require('./Review');
const Notification = require('./Notification');
const Coupon = require('./Coupon');
const SupportTicket = require('./SupportTicket');
const UserRefreshToken = require('./UserRefreshToken');

// --- Associations ---

// User & Role
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// User & City
City.hasMany(User, { foreignKey: 'city_id', as: 'users' });
User.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// Theatre & City
City.hasMany(Theatre, { foreignKey: 'city_id', as: 'theatres' });
Theatre.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// Event & City
City.hasMany(Event, { foreignKey: 'city_id', as: 'events' });
Event.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// User (Owner) & Theatre
User.hasMany(Theatre, { foreignKey: 'owner_id', as: 'ownedTheatres' });
Theatre.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User (Organizer) & Event
User.hasMany(Event, { foreignKey: 'organizer_id', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });

// Theatre & Screen
Theatre.hasMany(Screen, { foreignKey: 'theatre_id', as: 'screens', onDelete: 'CASCADE' });
Screen.belongsTo(Theatre, { foreignKey: 'theatre_id', as: 'theatre' });

// Screen & Seat
Screen.hasMany(Seat, { foreignKey: 'screen_id', as: 'seats', onDelete: 'CASCADE' });
Seat.belongsTo(Screen, { foreignKey: 'screen_id', as: 'screen' });

// Screen & Show
Screen.hasMany(Show, { foreignKey: 'screen_id', as: 'shows', onDelete: 'CASCADE' });
Show.belongsTo(Screen, { foreignKey: 'screen_id', as: 'screen' });

// Movie & Show
Movie.hasMany(Show, { foreignKey: 'movie_id', as: 'shows', onDelete: 'CASCADE' });
Show.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Movie & MovieCast
Movie.hasMany(MovieCast, { foreignKey: 'movie_id', as: 'cast', onDelete: 'CASCADE' });
MovieCast.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Movie & Review
Movie.hasMany(Review, { foreignKey: 'movie_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// User & Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & Wishlist
User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Movie & Wishlist
Movie.hasMany(Wishlist, { foreignKey: 'movie_id', as: 'wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Event & Wishlist
Event.hasMany(Wishlist, { foreignKey: 'event_id', as: 'wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// User & Booking
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Show & Booking
Show.hasMany(Booking, { foreignKey: 'show_id', as: 'bookings' });
Booking.belongsTo(Show, { foreignKey: 'show_id', as: 'show' });

// EventTicket & Booking
EventTicket.hasMany(Booking, { foreignKey: 'event_ticket_id', as: 'bookings' });
Booking.belongsTo(EventTicket, { foreignKey: 'event_ticket_id', as: 'eventTicket' });

// Booking & BookingSeat
Booking.hasMany(BookingSeat, { foreignKey: 'booking_id', as: 'bookingSeats', onDelete: 'CASCADE' });
BookingSeat.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Seat & BookingSeat
Seat.hasMany(BookingSeat, { foreignKey: 'seat_id', as: 'bookingSeats' });
BookingSeat.belongsTo(Seat, { foreignKey: 'seat_id', as: 'seat' });

// Booking & Payment
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Payment & Refund
Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds', onDelete: 'CASCADE' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

// EventCategory & Event
EventCategory.hasMany(Event, { foreignKey: 'category_id', as: 'events' });
Event.belongsTo(EventCategory, { foreignKey: 'category_id', as: 'category' });

// Event & EventTicket
Event.hasMany(EventTicket, { foreignKey: 'event_id', as: 'tickets', onDelete: 'CASCADE' });
EventTicket.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// User & Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & SupportTicket
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'supportTickets', onDelete: 'CASCADE' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & UserRefreshToken
User.hasMany(UserRefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'CASCADE' });
UserRefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Role,
  City,
  User,
  Movie,
  MovieCast,
  Theatre,
  Screen,
  Seat,
  Show,
  Booking,
  BookingSeat,
  Payment,
  Refund,
  Event,
  EventCategory,
  EventTicket,
  Wishlist,
  Review,
  Notification,
  Coupon,
  SupportTicket,
  UserRefreshToken
};

const { Booking, User, Theatre, Show, Event, Screen, sequelize } = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  async getAdminStats() {
    // 1. Total bookings count by status
    const bookingStats = await Booking.findAll({
      attributes: [
        'booking_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['booking_status']
    });

    const bookings = {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      failed: 0
    };

    bookingStats.forEach(stat => {
      const status = stat.booking_status;
      const count = parseInt(stat.get('count'), 10);
      bookings.total += count;
      if (bookings.hasOwnProperty(status)) {
        bookings[status] = count;
      }
    });

    // 2. Total revenue from completed/confirmed/paid bookings
    const totalRevenueResult = await Booking.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      where: {
        payment_status: 'paid',
        booking_status: 'confirmed'
      }
    });
    const totalRevenue = parseFloat(totalRevenueResult.get('revenue') || 0.00);

    // 3. User stats
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });

    // 4. Theatres count
    const totalTheatres = await Theatre.count();
    const activeTheatres = await Theatre.count({ where: { status: 'active' } });

    // 5. Events count
    const totalEvents = await Event.count();
    const activeEvents = await Event.count({ where: { status: 'active' } });

    // 6. Recent bookings
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }
      ]
    });

    return {
      revenue: totalRevenue,
      bookings,
      users: {
        total: totalUsers,
        active: activeUsers
      },
      theatres: {
        total: totalTheatres,
        active: activeTheatres
      },
      events: {
        total: totalEvents,
        active: activeEvents
      },
      recentBookings
    };
  }

  async getTheatreOwnerStats(ownerId) {
    // 1. Get all theatres owned by this owner
    const theatres = await Theatre.findAll({
      where: { owner_id: ownerId },
      attributes: ['id', 'theatre_name']
    });

    const theatreIds = theatres.map(t => t.id);

    if (theatreIds.length === 0) {
      return {
        revenue: 0,
        totalTheatres: 0,
        totalScreens: 0,
        totalShows: 0,
        bookingsCount: 0,
        recentBookings: []
      };
    }

    // 2. Get all screens under these theatres
    const screens = await Screen.findAll({
      where: { theatre_id: theatreIds },
      attributes: ['id']
    });
    const screenIds = screens.map(s => s.id);

    if (screenIds.length === 0) {
      return {
        revenue: 0,
        totalTheatres: theatreIds.length,
        totalScreens: 0,
        totalShows: 0,
        bookingsCount: 0,
        recentBookings: []
      };
    }

    // 3. Get all shows on these screens
    const shows = await Show.findAll({
      where: { screen_id: screenIds },
      attributes: ['id']
    });
    const showIds = shows.map(s => s.id);

    if (showIds.length === 0) {
      return {
        revenue: 0,
        totalTheatres: theatreIds.length,
        totalScreens: screenIds.length,
        totalShows: 0,
        bookingsCount: 0,
        recentBookings: []
      };
    }

    // 4. Calculate total revenue and bookings count for these shows
    const revenueResult = await Booking.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        show_id: showIds,
        payment_status: 'paid',
        booking_status: 'confirmed'
      }
    });

    const revenue = parseFloat(revenueResult.get('revenue') || 0.00);
    const bookingsCount = parseInt(revenueResult.get('count') || 0, 10);

    // 5. Recent bookings for owner's shows
    const recentBookings = await Booking.findAll({
      where: { show_id: showIds },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { 
          model: Show, 
          as: 'show',
          attributes: ['id', 'show_date', 'start_time'],
          include: [{ model: Screen, as: 'screen', attributes: ['id', 'screen_name'] }]
        }
      ]
    });

    return {
      revenue,
      totalTheatres: theatreIds.length,
      totalScreens: screenIds.length,
      totalShows: showIds.length,
      bookingsCount,
      recentBookings
    };
  }
}

module.exports = new DashboardService();

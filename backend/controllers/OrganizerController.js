const { Booking, Event, EventTicket, EventCategory, User, Review, City, sequelize } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const NotificationService = require('../services/NotificationService');

class OrganizerController {
  // 1. Dashboard Overview & Analytics
  async getAnalytics(req, res, next) {
    try {
      const organizerId = req.user.id;
      const now = new Date();

      // Find all events owned by organizer
      const events = await Event.findAll({
        where: { organizer_id: organizerId },
        include: [
          { model: EventCategory, as: 'category' },
          { model: EventTicket, as: 'tickets' },
          { model: Review, as: 'reviews', attributes: ['rating'] }
        ]
      });

      // Autonomous Event Reminder generation check (starts in next 24 hours)
      const reminderThreshold = new Date();
      reminderThreshold.setHours(reminderThreshold.getHours() + 24);
      
      const upcomingEventsForReminder = events.filter(e => 
        e.status === 'published' && 
        new Date(e.start_date) > now && 
        new Date(e.start_date) <= reminderThreshold
      );

      const NotificationModel = require('../models').Notification;
      for (const event of upcomingEventsForReminder) {
        const existingReminder = await NotificationModel.findOne({
          where: {
            user_id: organizerId,
            type: 'reminder',
            message: { [Op.like]: `%${event.title}%` }
          }
        });

        if (!existingReminder) {
          await NotificationService.createNotification(organizerId, {
            title: 'Upcoming Event Reminder',
            message: `Reminder: Your event "${event.title}" is starting on ${new Date(event.start_date).toLocaleString()}. Prepare check-in lists!`,
            type: 'reminder'
          }).catch(console.error);
        }
      }

      const eventIds = events.map(e => e.id);

      if (eventIds.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            kpis: {
              totalEvents: 0,
              upcomingEvents: 0,
              liveEvents: 0,
              completedEvents: 0,
              totalTicketsSold: 0,
              totalRevenue: 0,
              pendingRefunds: 0,
              newBookings: 0,
              checkInsToday: 0,
              averageRating: 0
            },
            charts: {
              dailySales: [],
              monthlyRevenue: [],
              ticketCategoryDistribution: [],
              topEvents: []
            }
          }
        });
      }

      // Find all tickets for these events
      const tickets = await EventTicket.findAll({
        where: { event_id: eventIds }
      });
      const ticketMap = {};
      tickets.forEach(t => {
        ticketMap[t.id] = t;
      });

      // Find all bookings for these tickets
      const bookings = await Booking.findAll({
        where: { event_ticket_id: Object.keys(ticketMap) },
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate KPIs
      const totalEvents = events.length;
      const upcomingEvents = events.filter(e => new Date(e.start_date) > now && e.status === 'published').length;
      const liveEvents = events.filter(e => new Date(e.start_date) <= now && new Date(e.end_date) >= now && e.status === 'published').length;
      const completedEvents = events.filter(e => new Date(e.end_date) < now || e.status === 'completed').length;

      let totalTicketsSold = 0;
      let totalRevenue = 0;
      let pendingRefunds = 0;
      let newBookings = 0;
      let checkInsToday = 0;

      // Group for charts
      const salesByDay = {};
      const revenueByMonth = {};
      const categorySales = {};
      const eventPerformance = {};

      // Initialize salesByDay for past 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        salesByDay[dateStr] = { date: dateStr, revenue: 0, sales: 0 };
      }

      // Initialize monthly revenue for past 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        revenueByMonth[monthLabel] = { month: monthLabel, revenue: 0 };
      }

      bookings.forEach(booking => {
        const ticket = ticketMap[booking.event_ticket_id];
        if (!ticket) return;

        const ticketPrice = parseFloat(ticket.price) || 1.0;
        const totalAmt = parseFloat(booking.total_amount) || 0.0;
        const discountAmt = parseFloat(booking.discount) || 0.0;
        const qty = Math.round((totalAmt + discountAmt) / ticketPrice) || 1;

        const bookingDate = new Date(booking.booking_date);
        const bookingDateStr = bookingDate.toISOString().split('T')[0];
        
        const monthLabel = `${monthNames[bookingDate.getMonth()]} ${bookingDate.getFullYear().toString().slice(-2)}`;

        // Calculate KPIs based on payment status
        if (booking.booking_status === 'confirmed' || booking.booking_status === 'completed') {
          totalTicketsSold += qty;
          totalRevenue += totalAmt;

          // Charts
          if (salesByDay[bookingDateStr]) {
            salesByDay[bookingDateStr].revenue += totalAmt;
            salesByDay[bookingDateStr].sales += qty;
          }
          if (revenueByMonth[monthLabel]) {
            revenueByMonth[monthLabel].revenue += totalAmt;
          }

          if (!categorySales[ticket.ticket_type]) {
            categorySales[ticket.ticket_type] = { category: ticket.ticket_type, quantity: 0, revenue: 0 };
          }
          categorySales[ticket.ticket_type].quantity += qty;
          categorySales[ticket.ticket_type].revenue += totalAmt;

          // Event Grouping
          const event = events.find(e => e.id === ticket.event_id);
          if (event) {
            if (!eventPerformance[event.id]) {
              eventPerformance[event.id] = { title: event.title, revenue: 0, ticketsSold: 0 };
            }
            eventPerformance[event.id].revenue += totalAmt;
            eventPerformance[event.id].ticketsSold += qty;
          }
        }

        if (booking.booking_status === 'cancelled' && booking.payment_status === 'pending') {
          pendingRefunds++;
        }

        // New bookings (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (bookingDate >= sevenDaysAgo) {
          newBookings++;
        }

        // Checkins today
        if (booking.checked_in && booking.checked_in_at) {
          const checkinDateStr = new Date(booking.checked_in_at).toISOString().split('T')[0];
          const todayStr = now.toISOString().split('T')[0];
          if (checkinDateStr === todayStr) {
            checkInsToday += qty;
          }
        }
      });

      // Average reviews
      let totalRating = 0;
      let totalRatingCount = 0;
      events.forEach(e => {
        if (e.reviews && e.reviews.length > 0) {
          e.reviews.forEach(r => {
            totalRating += r.rating;
            totalRatingCount++;
          });
        }
      });
      const averageRating = totalRatingCount > 0 ? parseFloat((totalRating / totalRatingCount).toFixed(1)) : 0;

      // Compile top events
      const topEventsList = Object.values(eventPerformance)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      res.status(200).json({
        status: 'success',
        data: {
          kpis: {
            totalEvents,
            upcomingEvents,
            liveEvents,
            completedEvents,
            totalTicketsSold,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            pendingRefunds,
            newBookings,
            checkInsToday,
            averageRating
          },
          charts: {
            dailySales: Object.values(salesByDay),
            monthlyRevenue: Object.values(revenueByMonth),
            ticketCategoryDistribution: Object.values(categorySales),
            topEvents: topEventsList
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. Booking / Participant Management
  async getBookings(req, res, next) {
    try {
      const organizerId = req.user.id;
      const { event_id, search, checked_in } = req.query;

      // Find all events belonging to organizer
      const eventFilter = { organizer_id: organizerId };
      if (event_id) {
        eventFilter.id = event_id;
      }
      
      const events = await Event.findAll({
        where: eventFilter,
        attributes: ['id', 'title']
      });
      const eventIds = events.map(e => e.id);

      if (eventIds.length === 0) {
        return res.status(200).json({ status: 'success', data: [] });
      }

      // Find all tickets for these events
      const tickets = await EventTicket.findAll({ where: { event_id: eventIds } });
      const ticketIds = tickets.map(t => t.id);

      const bookingFilter = { event_ticket_id: ticketIds };
      if (checked_in !== undefined) {
        bookingFilter.checked_in = checked_in === 'true';
      }

      const bookings = await Booking.findAll({
        where: bookingFilter,
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
          { 
            model: EventTicket, 
            as: 'eventTicket',
            attributes: ['id', 'ticket_type', 'price', 'event_id'],
            include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'start_date', 'venue'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Filter by search query (full name, email, or booking number)
      let filteredBookings = bookings;
      if (search) {
        const queryLower = search.toLowerCase();
        filteredBookings = bookings.filter(b => 
          (b.booking_number && b.booking_number.toLowerCase().includes(queryLower)) ||
          (b.user && b.user.full_name && b.user.full_name.toLowerCase().includes(queryLower)) ||
          (b.user && b.user.email && b.user.email.toLowerCase().includes(queryLower))
        );
      }

      // Reformat response with quantity calculation
      const responseData = filteredBookings.map(b => {
        const ticketPrice = parseFloat(b.eventTicket?.price) || 1.0;
        const total = parseFloat(b.total_amount) || 0.0;
        const discount = parseFloat(b.discount) || 0.0;
        const quantity = Math.round((total + discount) / ticketPrice) || 1;

        return {
          id: b.id,
          booking_number: b.booking_number,
          booking_date: b.booking_date,
          total_amount: b.total_amount,
          discount: b.discount,
          booking_status: b.booking_status,
          payment_status: b.payment_status,
          checked_in: b.checked_in,
          checked_in_at: b.checked_in_at,
          quantity,
          user: b.user,
          event: b.eventTicket?.event,
          ticket_type: b.eventTicket?.ticket_type
        };
      });

      res.status(200).json({
        status: 'success',
        data: responseData
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Toggle Participant Check-in
  async checkInBooking(req, res, next) {
    try {
      const { id } = req.params;
      const organizerId = req.user.id;

      const booking = await Booking.findByPk(id, {
        include: [{ model: EventTicket, as: 'eventTicket' }]
      });

      if (!booking || !booking.event_ticket_id) {
        throw new AppError('Booking not found', 404);
      }

      // Check ownership
      const event = await Event.findOne({
        where: { id: booking.eventTicket.event_id, organizer_id: organizerId }
      });

      if (!event) {
        throw new AppError('You do not have permission to check in for this event', 403);
      }

      if (booking.booking_status !== 'confirmed') {
        throw new AppError('Only confirmed bookings can be checked in', 400);
      }

      booking.checked_in = !booking.checked_in;
      booking.checked_in_at = booking.checked_in ? new Date() : null;
      await booking.save();

      res.status(200).json({
        status: 'success',
        message: booking.checked_in ? 'Participant checked in successfully' : 'Check-in cancelled',
        data: {
          checked_in: booking.checked_in,
          checked_in_at: booking.checked_in_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. Cancel booking (and trigger refund)
  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const organizerId = req.user.id;

      const booking = await Booking.findByPk(id, {
        include: [
          { model: EventTicket, as: 'eventTicket', include: [{ model: Event, as: 'event' }] }
        ]
      });

      if (!booking || !booking.event_ticket_id) {
        throw new AppError('Booking not found', 404);
      }

      // Check ownership
      if (booking.eventTicket.event.organizer_id !== organizerId) {
        throw new AppError('You do not have permission to manage this booking', 403);
      }

      if (booking.booking_status === 'cancelled') {
        throw new AppError('This booking has already been cancelled', 400);
      }

      // Call BookingService cancellation logic inside a transaction to be safe
      const BookingService = require('../services/BookingService');
      const updatedBooking = await BookingService.cancelBooking(booking.user_id, id, 'Admin');

      // Send refund notification specifically for the organizer action
      await NotificationService.createNotification(booking.user_id, {
        title: 'Ticket Refunded',
        message: `Your booking ${booking.booking_number} for "${booking.eventTicket.event.title}" has been cancelled and refunded by the event organizer.`,
        type: 'refund'
      }).catch(console.error);

      // Notify organizer of their own cancellation success
      await NotificationService.createNotification(organizerId, {
        title: 'Booking Cancelled',
        message: `You cancelled Booking ${booking.booking_number} for "${booking.eventTicket.event.title}" and refunded the customer.`,
        type: 'cancellation'
      }).catch(console.error);

      res.status(200).json({
        status: 'success',
        message: 'Registration cancelled and tickets refunded',
        data: updatedBooking
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrganizerController();

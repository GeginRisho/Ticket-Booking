const { User, Event, EventTicket, Booking, Role, City } = require('../models');
const AppError = require('../utils/appError');
const NotificationService = require('../services/NotificationService');

class AdminController {
  // 1. List Event Organizers
  async getOrganizers(req, res, next) {
    try {
      const { status } = req.query;
      
      const role = await Role.findOne({ where: { role_name: 'Event Organizer' } });
      if (!role) {
        throw new AppError('Event Organizer role not configured', 500);
      }

      const where = { role_id: role.id };
      if (status) {
        where.status = status;
      }

      const organizers = await User.findAll({
        where,
        attributes: { exclude: ['password_hash'] },
        include: [{ model: City, as: 'city', attributes: ['id', 'city_name'] }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        status: 'success',
        data: organizers
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. Get Organizer Details
  async getOrganizerDetails(req, res, next) {
    try {
      const { id } = req.params;
      const organizer = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: City, as: 'city', attributes: ['id', 'city_name'] }]
      });

      if (!organizer) {
        throw new AppError('Organizer not found', 404);
      }

      // Check if role is organizer
      const role = await Role.findByPk(organizer.role_id);
      if (!role || role.role_name !== 'Event Organizer') {
        throw new AppError('User is not an Event Organizer', 400);
      }

      res.status(200).json({
        status: 'success',
        data: organizer
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Update Organizer Status (Approve / Reject / Suspend)
  async updateOrganizerStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body; // active (Approved), rejected, suspended

      if (!['active', 'rejected', 'suspended'].includes(status)) {
        throw new AppError('Invalid status value', 400);
      }

      const organizer = await User.findByPk(id);
      if (!organizer) {
        throw new AppError('Organizer not found', 404);
      }

      // Update status
      organizer.status = status;
      await organizer.save();

      // Trigger notifications
      if (status === 'active') {
        await NotificationService.createNotification(organizer.id, {
          title: 'Registration Approved',
          message: 'Your Event Organizer account has been approved by the administrator. You can now log in and access your workspace.',
          type: 'approval'
        }).catch(console.error);
      } else if (status === 'rejected') {
        await NotificationService.createNotification(organizer.id, {
          title: 'Registration Rejected',
          message: `Your Event Organizer account registration was rejected. Reason: ${reason || 'Failed compliance checks.'}`,
          type: 'rejection'
        }).catch(console.error);
      } else if (status === 'suspended') {
        await NotificationService.createNotification(organizer.id, {
          title: 'Account Suspended',
          message: 'Your Event Organizer account has been suspended by the administrator.',
          type: 'suspension'
        }).catch(console.error);
      }

      res.status(200).json({
        status: 'success',
        message: `Organizer status updated to ${status === 'active' ? 'Approved' : status} successfully`,
        data: organizer
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. View Organizer's Events
  async getOrganizerEvents(req, res, next) {
    try {
      const { id } = req.params;
      const events = await Event.findAll({
        where: { organizer_id: id },
        include: [{ model: City, as: 'city', attributes: ['id', 'city_name'] }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        status: 'success',
        data: events
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. Organizer Performance / Analytics
  async getOrganizerPerformance(req, res, next) {
    try {
      const { id } = req.params;
      
      const events = await Event.findAll({ where: { organizer_id: id } });
      const eventIds = events.map(e => e.id);

      if (eventIds.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            eventsCreated: 0,
            ticketsSold: 0,
            revenue: 0,
            averageRating: 0
          }
        });
      }

      const tickets = await EventTicket.findAll({ where: { event_id: eventIds } });
      const ticketIds = tickets.map(t => t.id);

      const bookings = await Booking.findAll({
        where: {
          event_ticket_id: ticketIds,
          booking_status: ['confirmed', 'completed']
        }
      });

      let ticketsSold = 0;
      let revenue = 0;

      const ticketPriceMap = {};
      tickets.forEach(t => {
        ticketPriceMap[t.id] = parseFloat(t.price) || 1.0;
      });

      bookings.forEach(b => {
        const price = ticketPriceMap[b.event_ticket_id] || 1.0;
        const total = parseFloat(b.total_amount) || 0.0;
        const discount = parseFloat(b.discount) || 0.0;
        const qty = Math.round((total + discount) / price) || 1;
        
        ticketsSold += qty;
        revenue += total;
      });

      // Get reviews average
      const reviews = await Review.findAll({
        where: { event_id: eventIds },
        attributes: ['rating']
      });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;

      res.status(200).json({
        status: 'success',
        data: {
          eventsCreated: events.length,
          ticketsSold,
          revenue: parseFloat(revenue.toFixed(2)),
          averageRating
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();

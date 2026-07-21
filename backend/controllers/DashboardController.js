const DashboardService = require('../services/DashboardService');

class DashboardController {
  async getDashboardStats(req, res, next) {
    try {
      let userRole = '';
      if (req.user && req.user.role) {
        if (typeof req.user.role === 'object') {
          userRole = req.user.role.role_name || req.user.role.name || '';
        } else {
          userRole = req.user.role;
        }
      }

      let stats;
      if (userRole === 'Admin' || userRole === 'Super Admin') {
        stats = await DashboardService.getAdminStats();
      } else if (userRole === 'Theatre Owner' || userRole === 'Owner') {
        stats = await DashboardService.getTheatreOwnerStats(req.user.id);
      } else {
        // Customers/Event Organizers get access denied
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You do not have permission to access dashboard statistics.'
        });
      }

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();

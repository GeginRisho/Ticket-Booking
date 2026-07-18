const DashboardService = require('../services/DashboardService');

class DashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const userRole = req.user.role.role_name;
      let stats;

      if (userRole === 'Admin') {
        stats = await DashboardService.getAdminStats();
      } else if (userRole === 'Theatre Owner') {
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

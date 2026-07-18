const WishlistService = require('../services/WishlistService');

class WishlistController {
  async getWishlist(req, res, next) {
    try {
      const wishlist = await WishlistService.getWishlist(req.user.id);
      res.status(200).json({
        status: 'success',
        results: wishlist.length,
        data: { wishlist }
      });
    } catch (err) {
      next(err);
    }
  }

  async addToWishlist(req, res, next) {
    try {
      const item = await WishlistService.addToWishlist(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Item added to wishlist successfully',
        data: { item }
      });
    } catch (err) {
      next(err);
    }
  }

  async removeFromWishlist(req, res, next) {
    try {
      await WishlistService.removeFromWishlist(req.user.id, req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Item removed from wishlist successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WishlistController();

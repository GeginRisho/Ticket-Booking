const express = require('express');
const WishlistController = require('../controllers/WishlistController');
const { protect } = require('../middlewares/authMiddleware');
const {
  addToWishlistValidator,
  removeFromWishlistValidator
} = require('../validators/wishlistValidator');

const router = express.Router();

// All wishlist routes are protected
router.use(protect);

router.get('/', WishlistController.getWishlist);
router.post('/', addToWishlistValidator, WishlistController.addToWishlist);
router.delete('/:id', removeFromWishlistValidator, WishlistController.removeFromWishlist);

module.exports = router;

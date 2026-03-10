import Wishlist from '../models/Wishlist.js';

export class WishlistController {
    static async toggleWishlist(req, res) {
        try {
            const { courseId } = req.body;
            const userId = req.user.userId;

            const existing = await Wishlist.findOne({ userId, courseId });
            if (existing) {
                await Wishlist.findByIdAndDelete(existing._id);
                return res.status(200).json({ message: 'Removed from wishlist' });
            }

            await Wishlist.create({ userId, courseId });
            res.status(201).json({ message: 'Added to wishlist' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to toggle wishlist' });
        }
    }

    static async getUserWishlist(req, res) {
        try {
            const items = await Wishlist.find({ userId: req.user.userId }).populate('courseId');
            res.status(200).json({ wishlist: items.map(item => item.courseId) });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch wishlist' });
        }
    }
}

export default WishlistController;

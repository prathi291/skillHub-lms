import Review from '../models/Review.js';
import Course from '../models/Course.js';

export class ReviewController {
    static async createReview(req, res) {
        try {
            const { courseId, rating, comment } = req.body;
            const userId = req.user.userId;

            await Review.create({ courseId, userId, rating, comment });

            // Update course rating metrics
            const reviews = await Review.find({ courseId });
            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
            await Course.findByIdAndUpdate(courseId, { rating: avg, reviewCount: reviews.length });

            res.status(201).json({ message: 'Review added successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add review' });
        }
    }

    static async getReviews(req, res) {
        try {
            const reviews = await Review.find({ courseId: req.params.courseId }).populate('userId', 'name avatar_url');
            res.status(200).json({ reviews });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    }
}

export default ReviewController;

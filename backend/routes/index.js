import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizationMiddleware from '../middlewares/authorizationMiddleware.js';
import CourseController from '../controllers/courseController.js';
import UserController from '../controllers/userController.js';
import ReviewController from '../controllers/reviewController.js';
import WishlistController from '../controllers/wishlistController.js';
import CertificateController from '../controllers/certificateController.js';
import AIController from '../controllers/aiController.js';
import EnrollmentController from '../controllers/enrollmentController.js';
import ProgressController from '../controllers/progressController.js';

const router = express.Router();

// ==================== COURSES ====================
router.get('/courses', CourseController.getAll);
router.get('/courses/:courseId', CourseController.getById);
router.post('/courses', authMiddleware, authorizationMiddleware(['instructor', 'admin']), CourseController.create);
router.put('/courses/:courseId', authMiddleware, authorizationMiddleware(['instructor', 'admin']), CourseController.update);
router.delete('/courses/:courseId', authMiddleware, authorizationMiddleware(['admin']), CourseController.delete);

// ==================== USERS & PROFILES ====================
router.get('/users/profile', authMiddleware, UserController.getProfile);
router.put('/users/profile', authMiddleware, UserController.updateProfile);
router.get('/instructors/:instructorId', UserController.getInstructorProfile);

// ==================== ENROLLMENTS ====================
router.post('/enrollments', authMiddleware, EnrollmentController.enroll);
router.post('/enroll/:courseId', authMiddleware, EnrollmentController.enroll);
router.get('/enrollments', authMiddleware, EnrollmentController.getByUser);

// ==================== REVIEWS ====================
router.post('/reviews', authMiddleware, ReviewController.createReview);
router.get('/reviews/:courseId', ReviewController.getReviews);

// ==================== PROGRESS ====================
router.post('/progress', authMiddleware, ProgressController.markComplete);
router.get('/progress/:courseId', authMiddleware, ProgressController.getCourseProgress);

// ==================== WISHLIST ====================
router.post('/wishlist', authMiddleware, WishlistController.toggleWishlist);
router.get('/wishlist', authMiddleware, WishlistController.getUserWishlist);

// ==================== CERTIFICATES ====================
router.get('/certificates/:courseId', authMiddleware, CertificateController.generateCertificate);

// ==================== AI ASSISTANT ====================
router.post('/ai/chat', AIController.chat);

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;

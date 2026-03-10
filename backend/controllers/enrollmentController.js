import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export class EnrollmentController {
  static async enroll(req, res) {
    try {
      const course_id = req.body.courseId || req.body.course_id || req.params.courseId;
      const userId = req.user.userId;

      if (!course_id) {
        return res.status(400).json({
          error: 'Course ID is required',
          code: 'MISSING_FIELDS'
        });
      }

      // Check if course exists
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND'
        });
      }

      // Check if already enrolled
      const existing = await Enrollment.findOne({ userId, courseId: course_id });
      if (existing) {
        return res.status(409).json({
          error: 'You are already enrolled in this course.',
          code: 'ALREADY_ENROLLED'
        });
      }

      const enrollment = await Enrollment.create({
        userId: userId,
        courseId: course_id
      });

      res.status(201).json({
        message: 'Enrolled successfully',
        enrollment
      });
    } catch (error) {
      console.error('Enrollment error:', error);
      res.status(500).json({
        error: 'Enrollment failed',
        code: 'ENROLLMENT_ERROR'
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const enrollments = await Enrollment.find({ userId })
        .populate('courseId')
        .skip(offset)
        .limit(parseInt(limit));

      res.status(200).json({
        enrollments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch enrollments',
        code: 'FETCH_ERROR'
      });
    }
  }

  static async getByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const enrollments = await Enrollment.find({ courseId })
        .populate('userId', 'name email')
        .skip(offset)
        .limit(parseInt(limit));

      res.status(200).json({
        enrollments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch course enrollments',
        code: 'FETCH_ERROR'
      });
    }
  }

  static async unenroll(req, res) {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({
          error: 'Enrollment not found',
          code: 'ENROLLMENT_NOT_FOUND'
        });
      }

      await Enrollment.findByIdAndDelete(enrollmentId);

      res.status(200).json({
        message: 'Unenrolled successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to unenroll',
        code: 'UNENROLL_ERROR'
      });
    }
  }
}

export default EnrollmentController;

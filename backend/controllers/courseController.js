import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import { pickVideoForLesson, isValidYouTubeUrl } from '../utils/videoFallback.js';

export class CourseController {
  static async getAll(req, res) {
    try {
      const { search, category, rating, price, level, sort } = req.query;

      let query = { deleted_at: null };
      if (category) query.category = category;
      if (level) query.level = level;
      if (rating) query.rating = { $gte: Number(rating) };
      if (price === 'free') query.price = 0;
      if (price === 'paid') query.price = { $gt: 0 };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      let sortObj = { createdAt: -1 };
      if (sort === 'rating') sortObj = { rating: -1 };
      if (sort === 'popular') sortObj = { reviewCount: -1 };

      const courses = await Course.find(query).populate('instructor_id', 'name avatar_url').sort(sortObj);
      res.status(200).json({ courses });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  static async getById(req, res) {
    try {
      const course = await Course.findById(req.params.courseId).populate('instructor_id', 'name avatar_url bio');
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const lessons = await Lesson.find({ course_id: course._id }).sort('order_index');

      // Guarantee every lesson has a valid video URL
      const enrichedLessons = lessons.map(lesson => {
        const raw = lesson.toObject ? lesson.toObject() : { ...lesson };
        if (!isValidYouTubeUrl(raw.video_url)) {
          raw.video_url = pickVideoForLesson(raw.title, course.category);
        }
        return raw;
      });

      let progress = null;
      if (req.user) {
        const completedCount = await Progress.countDocuments({ courseId: course._id, userId: req.user.userId, completed: true });
        progress = { completed_lessons: completedCount, total_lessons: enrichedLessons.length };
      }

      res.status(200).json({ course, lessons: enrichedLessons, progress });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  static async create(req, res) {
    try {
      const course = await Course.create({ ...req.body, instructor_id: req.user.userId });
      res.status(201).json({ course });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }

  static async update(req, res) {
    try {
      const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
      res.status(200).json({ course });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update' });
    }
  }

  static async delete(req, res) {
    try {
      await Course.findByIdAndUpdate(req.params.courseId, { deleted_at: new Date() });
      res.status(200).json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete' });
    }
  }
}

export default CourseController;

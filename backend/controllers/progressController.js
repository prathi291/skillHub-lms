import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';

export class ProgressController {

  // POST /api/progress  — mark a lesson as complete
  static async markComplete(req, res) {
    try {
      const { lessonId, courseId } = req.body;
      const userId = req.user.userId;

      if (!lessonId || !courseId) {
        return res.status(400).json({
          error: 'lessonId and courseId are required',
          code: 'MISSING_FIELDS'
        });
      }

      // Verify lesson exists
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found', code: 'LESSON_NOT_FOUND' });
      }

      // Upsert: create or update
      await Progress.findOneAndUpdate(
        { userId, courseId, lessonId },
        { userId, courseId, lessonId, completed: true },
        { upsert: true, new: true }
      );

      // Recalculate progress for this course
      const totalLessons = await Lesson.countDocuments({ course_id: courseId });
      const completedCount = await Progress.countDocuments({ userId, courseId, completed: true });
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return res.status(200).json({
        message: 'Lesson marked as complete',
        progress: {
          completed_lessons: completedCount,
          total_lessons: totalLessons,
          completion_percentage: percentage
        }
      });
    } catch (error) {
      console.error('Mark complete error:', error);
      return res.status(500).json({ error: 'Failed to mark lesson as complete', code: 'UPDATE_ERROR' });
    }
  }

  // GET /api/progress/:courseId  — get progress for a specific course
  static async getCourseProgress(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      const totalLessons = await Lesson.countDocuments({ course_id: courseId });
      const completedRecords = await Progress.find({ userId, courseId, completed: true }).select('lessonId');
      const completedCount = completedRecords.length;
      const completedLessonIds = completedRecords.map(r => r.lessonId.toString());
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return res.status(200).json({
        progress: {
          course_id: courseId,
          completed_lessons: completedCount,
          total_lessons: totalLessons,
          completion_percentage: percentage,
          completed_lesson_ids: completedLessonIds
        }
      });
    } catch (error) {
      console.error('Get progress error:', error);
      return res.status(500).json({ error: 'Failed to fetch progress', code: 'FETCH_ERROR' });
    }
  }
}

export default ProgressController;

import Lesson from '../models/Lesson.js';
import Section from '../models/Section.js';

export class LessonController {
  static async getById(req, res) {
    try {
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        });
      }

      res.status(200).json({ lesson });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch lesson',
        code: 'FETCH_ERROR'
      });
    }
  }

  static async getBySectionId(req, res) {
    try {
      const { sectionId } = req.params;

      const lessons = await Lesson.getBySectionId(sectionId);

      res.status(200).json({ lessons });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch lessons',
        code: 'FETCH_ERROR'
      });
    }
  }

  static async create(req, res) {
    try {
      const { sectionId } = req.params;
      const { title, description, order_number, youtube_url, duration } = req.body;

      if (!title || !youtube_url || !duration) {
        return res.status(400).json({
          error: 'Title, youtube_url, and duration are required',
          code: 'MISSING_FIELDS'
        });
      }

      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({
          error: 'Section not found',
          code: 'SECTION_NOT_FOUND'
        });
      }

      const lesson = await Lesson.create({
        section_id: sectionId,
        course_id: section.course_id,
        title,
        description,
        order_number,
        youtube_url,
        duration
      });

      res.status(201).json({
        message: 'Lesson created successfully',
        lesson
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create lesson',
        code: 'CREATE_ERROR'
      });
    }
  }

  static async update(req, res) {
    try {
      const { lessonId } = req.params;
      const { title, description, order_number, youtube_url, duration } = req.body;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        });
      }

      const updated = await Lesson.update(lessonId, {
        title,
        description,
        order_number,
        youtube_url,
        duration
      });

      res.status(200).json({
        message: 'Lesson updated successfully',
        lesson: updated
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update lesson',
        code: 'UPDATE_ERROR'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        });
      }

      await Lesson.delete(lessonId);

      res.status(200).json({
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete lesson',
        code: 'DELETE_ERROR'
      });
    }
  }
}

export default LessonController;

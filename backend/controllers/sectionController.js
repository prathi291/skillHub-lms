import Section from '../models/Section.js';

export class SectionController {
  static async getByCourse(req, res) {
    try {
      const { courseId } = req.params;

      const sections = await Section.getByCourseId(courseId);

      res.status(200).json({ sections });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch sections',
        code: 'FETCH_ERROR'
      });
    }
  }

  static async create(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, order_number } = req.body;

      if (!title) {
        return res.status(400).json({
          error: 'Title is required',
          code: 'MISSING_FIELDS'
        });
      }

      const section = await Section.create({
        course_id: courseId,
        title,
        description,
        order_number
      });

      res.status(201).json({
        message: 'Section created successfully',
        section
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create section',
        code: 'CREATE_ERROR'
      });
    }
  }

  static async update(req, res) {
    try {
      const { sectionId } = req.params;
      const { title, description, order_number } = req.body;

      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({
          error: 'Section not found',
          code: 'SECTION_NOT_FOUND'
        });
      }

      const updated = await Section.update(sectionId, {
        title,
        description,
        order_number
      });

      res.status(200).json({
        message: 'Section updated successfully',
        section: updated
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update section',
        code: 'UPDATE_ERROR'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { sectionId } = req.params;

      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({
          error: 'Section not found',
          code: 'SECTION_NOT_FOUND'
        });
      }

      await Section.delete(sectionId);

      res.status(200).json({
        message: 'Section deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete section',
        code: 'DELETE_ERROR'
      });
    }
  }
}

export default SectionController;

import { getPool } from '../config/database.js';

export class Section {
  static async findById(sectionId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM sections WHERE id = ? AND deleted_at IS NULL',
      [sectionId]
    );
    return rows[0] || null;
  }

  static async getByCourseId(courseId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM sections WHERE course_id = ? AND deleted_at IS NULL ORDER BY order_number ASC',
      [courseId]
    );
    return rows;
  }

  static async create(sectionData) {
    const pool = getPool();
    const { course_id, title, description, order_number } = sectionData;

    const [result] = await pool.query(
      `INSERT INTO sections (course_id, title, description, order_number) 
       VALUES (?, ?, ?, ?)`,
      [course_id, title, description, order_number]
    );

    return this.findById(result.insertId);
  }

  static async update(sectionId, updates) {
    const pool = getPool();
    const { title, description, order_number } = updates;

    await pool.query(
      `UPDATE sections SET title = ?, description = ?, order_number = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, description, order_number, sectionId]
    );

    return this.findById(sectionId);
  }

  static async delete(sectionId) {
    const pool = getPool();
    await pool.query(
      'UPDATE sections SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sectionId]
    );
  }
}

export default Section;

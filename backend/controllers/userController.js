import User from '../models/User.js';
import Course from '../models/Course.js';
import { hashPassword, comparePassword } from '../utils/passwordHash.js';

export class UserController {
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true }).select('-password');
      res.status(200).json({ user, message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async getInstructorProfile(req, res) {
    try {
      const instructor = await User.findById(req.params.instructorId).select('-password');
      if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

      const courses = await Course.find({ instructor_id: instructor._id });

      res.status(200).json({ instructor, courses });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instructor' });
    }
  }
}

export default UserController;

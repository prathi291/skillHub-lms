import { hashPassword, comparePassword } from '../utils/passwordHash.js';
import { generateToken, generateRefreshToken, verifyToken } from '../config/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import User from '../models/User.js';
import crypto from 'crypto';

export class AuthController {
  static async signup(req, res) {
    try {
      const { name, email, password, role = 'student' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required'
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          error: 'Password is too weak. It must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered'
        });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      const token = generateToken(user._id, user.email, user.role);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Required for sameSite: 'none'
        sameSite: 'none', // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during signup'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          error: 'Your account has been disabled. Please contact support.'
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id, user.email, user.role);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during login'
      });
    }
  }

  static async logout(req, res) {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: 'none'
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found with that email' });
      }

      // Create reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Set reset token and expiry on user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      // MOCK EMAIL LOGIC
      console.log('-------------------------------------------');
      console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
      console.log(`🔗 RESET LINK: http://localhost:5173/reset-password/${resetToken}`);
      console.log('-------------------------------------------');

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email (check server console)'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          error: 'New password is too weak.'
        });
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
      }

      // Hash and set new password
      user.password = await hashPassword(password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully. You can now log in.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}

export default AuthController;

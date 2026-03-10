import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  avatar_url: { type: String },
  bio: { type: String },
  occupation: { type: String },
  location: { type: String },
  is_active: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// For backwards compatibility with old raw query methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};
userSchema.statics.findById = function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return this.findOne({ _id: id });
};

const User = mongoose.model('User', userSchema);
export default User;

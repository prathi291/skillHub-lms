import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail_url: { type: String },
  category: { type: String },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, default: 'All Levels' },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bestseller: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);

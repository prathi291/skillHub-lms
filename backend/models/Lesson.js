import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  video_url: { type: String },
  duration: { type: String, default: '00:00' },
  order_index: { type: Number, default: 0 },
  is_published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);

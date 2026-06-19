import mongoose from "mongoose";

const MajorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  advisorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

MajorSchema.index({
  name: 1,
  advisorEmail: 1
}, {
  unique: true
});

export default mongoose.models.Major ||
  mongoose.model("Major", MajorSchema);

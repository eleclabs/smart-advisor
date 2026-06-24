import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  studentCode: {
    type: String,
    required: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  classLevel: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ["ชาย", "หญิง"],
    required: true,
    trim: true
  },
  birthDate: {
    type: String,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  height: {
    type: String,
    trim: true
  },
  bloodType: {
    type: String,
    trim: true
  },
  religion: {
    type: String,
    trim: true
  },
  guardianName: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  profileImageUrl: {
    type: String,
    trim: true
  },
  profileImagePublicId: {
    type: String,
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

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);

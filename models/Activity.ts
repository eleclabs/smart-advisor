import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  classLevel: { type: String, required: true, trim: true },
  major: { type: String, required: true, trim: true },
  weekNumber: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  objectives: { type: String, trim: true },
  activitySteps: { type: String, trim: true },
  evaluation: { type: String, trim: true },
  activityResults: { type: String, trim: true },
  problems: { type: String, trim: true },
  followUpStudents: { type: String, trim: true },
  supportingDocuments: { type: String, trim: true },
  suggestions: { type: String, trim: true },
  advisorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  }
}, {
  timestamps: true
});

const Activity = mongoose.models.Activity ||
  mongoose.model(
    "Activity",
    ActivitySchema,
    "studentdevelopmentactivities"
  );

export default Activity;

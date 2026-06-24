import mongoose from "mongoose";

const ActivityAttachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  contentType: { type: String, required: true, trim: true },
  size: { type: Number, required: true },
  publicId: { type: String, trim: true },
  url: { type: String, trim: true },
  resourceType: {
    type: String,
    enum: ["image", "raw"]
  },
  kind: {
    type: String,
    enum: ["document", "image"],
    required: true
  },
  data: Buffer
}, {
  _id: false
});

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
  attachments: {
    type: [ActivityAttachmentSchema],
    default: []
  },
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

import mongoose from "mongoose";

const ScreeningSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  studentName: { type: String, required: true, trim: true },
  nickname: { type: String, trim: true },
  classLevel: { type: String, trim: true },
  studentNumber: { type: String, trim: true },
  guardianName: { type: String, trim: true },
  guardianRelationship: { type: String, trim: true },
  contactPhone: { type: String, trim: true },
  parentStatus: { type: String, trim: true },
  livingWith: { type: String, trim: true },
  livingWithOther: { type: String, trim: true },
  housingType: { type: String, trim: true },
  housingOther: { type: String, trim: true },
  commuteMethods: [{ type: String, trim: true }],
  commuteOther: { type: String, trim: true },
  learningBehavior: { type: String, trim: true },
  health: { type: String, trim: true },
  familyIncome: { type: String, trim: true },
  assistanceNeeds: [{ type: String, trim: true }],
  assistanceOther: { type: String, trim: true },
  advisorSummary: { type: String, trim: true },
  advisorSummaryOther: { type: String, trim: true },
  assistanceApproach: { type: String, trim: true },
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

const Screening = mongoose.models.Screening ||
  mongoose.model("Screening", ScreeningSchema, "studentscreenings");

export default Screening;

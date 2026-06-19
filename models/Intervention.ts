import mongoose from "mongoose";

const InterventionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  studentName: { type: String, required: true, trim: true },
  studentCode: { type: String, trim: true },
  classLevel: { type: String, trim: true },
  problem: { type: String, required: true, trim: true },
  solutions: [{ type: String, trim: true }],
  operationPeriod: { type: String, trim: true },
  advisorName: { type: String, trim: true },
  groupActivityName: { type: String, trim: true },
  groupActivityMinutes: { type: String, trim: true },
  groupActivitySteps: { type: String, trim: true },
  changeLevel: { type: String, trim: true },
  resultStatus: { type: String, trim: true },
  resultSummary: { type: String, trim: true },
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

const Intervention = mongoose.models.Intervention ||
  mongoose.model("Intervention", InterventionSchema);

export default Intervention;

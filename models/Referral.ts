import mongoose from "mongoose";

const FollowUpSchema = new mongoose.Schema({
  number: { type: String, trim: true },
  detail: { type: String, trim: true }
}, {
  _id: false
});

const ReferralSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  studentName: { type: String, required: true, trim: true },
  classLevel: { type: String, trim: true },
  studentNumber: { type: String, trim: true },
  major: { type: String, trim: true },
  referralTypes: [{ type: String, trim: true }],
  internalDestination: { type: String, trim: true },
  externalDestination: { type: String, trim: true },
  reasons: [{ type: String, trim: true }],
  academicReason: { type: String, trim: true },
  behaviorReason: { type: String, trim: true },
  emotionalReason: { type: String, trim: true },
  familyReason: { type: String, trim: true },
  otherReason: { type: String, trim: true },
  problemSummary: { type: String, trim: true },
  coordinationDate: { type: String, trim: true },
  agencyName: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  agencyAddress: { type: String, trim: true },
  coordinationDetails: { type: String, trim: true },
  operationStatus: { type: String, trim: true },
  assistanceResult: { type: String, trim: true },
  followUps: [FollowUpSchema],
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

const Referral = mongoose.models.Referral ||
  mongoose.model("Referral", ReferralSchema);

export default Referral;

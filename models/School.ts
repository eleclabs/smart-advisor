import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  vocationalOffice: { type: String, trim: true },
  region: { type: String, trim: true },
  educationType: { type: String, trim: true },
  province: { type: String, trim: true }
});

SchoolSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.School || mongoose.model("School", SchoolSchema);

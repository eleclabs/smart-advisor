import mongoose from "mongoose";
import { USER_ROLES } from "@/lib/roles";

const UserSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: [...USER_ROLES],
    default: "teacher",
    required: true
  },
  roles: {
    type: [{
      type: String,
      enum: [...USER_ROLES]
    }],
    default: undefined
  },
  gender: { type: String, trim: true },
  title: { type: String, trim: true },
  firstNameTh: { type: String, trim: true },
  lastNameTh: { type: String, trim: true },
  firstNameEn: { type: String, trim: true },
  lastNameEn: { type: String, trim: true },
  phone: { type: String, trim: true },
  citizenId: { type: String, trim: true },
  region: { type: String, trim: true },
  province: { type: String, trim: true },
  vocationalOffice: { type: String, trim: true },
  educationType: { type: String, trim: true },
  schoolProvince: { type: String, trim: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  schoolName: { type: String, trim: true },
  active: {
    type: Boolean,
    default: true
  },
  profileImageUrl: { type: String, trim: true },
  profileImagePublicId: { type: String, trim: true },
  passwordResetToken: String,
  passwordResetExpires: Date
},{
  timestamps:true
});

export default mongoose.models.User || mongoose.model("User",UserSchema);


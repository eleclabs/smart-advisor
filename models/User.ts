import mongoose from "mongoose";
import { USER_ROLES } from "@/lib/roles";

const UserSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String,unique: true },
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

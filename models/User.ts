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
  active: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date
},{
  timestamps:true
});

export default mongoose.models.User || mongoose.model("User",UserSchema);


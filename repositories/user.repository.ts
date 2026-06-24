import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const SAFE_USER_FIELDS =
  "fullname email role active profileImageUrl profileImagePublicId createdAt updatedAt";

export type UserManagementData = {
  fullname: string;
  email: string;
  role: string;
  active: boolean;
  profileImageUrl?: string;
  profileImagePublicId?: string;
};

export class UserRepository {
    
  static async findByEmail(email: string) {
    await connectDB();

    return User.findOne({
      email
    });
  }

  static async create(data: Record<string, unknown>) {
    await connectDB();

    return User.create(data);
  }

  static async findAll() {
    await connectDB();

    return User.find()
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async search(query: string) {
    await connectDB();

    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");

    return User.find({
      $or: [
        { fullname: pattern },
        { email: pattern }
      ]
    })
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  static async findById(id: string) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return User.findById(id).select(SAFE_USER_FIELDS).lean();
  }

  static async updateById(id: string, data: UserManagementData) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).select(SAFE_USER_FIELDS);
  }

  static async deleteById(id: string) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return User.findByIdAndDelete(id);
  }

  static async countByRole(role: string) {
    await connectDB();
    return User.countDocuments({ role });
  }

  static async setPasswordResetToken(
    email: string,
    passwordResetToken: string,
    passwordResetExpires: Date
  ) {
    await connectDB();

    return User.updateOne(
      {
        email
      },
      {
        passwordResetToken,
        passwordResetExpires
      }
    );
  }

}

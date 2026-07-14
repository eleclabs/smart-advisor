import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const SAFE_USER_FIELDS =
  "fullname email role roles active profileImageUrl profileImagePublicId gender title firstNameTh lastNameTh firstNameEn lastNameEn phone citizenId region province vocationalOffice educationType schoolProvince schoolId schoolName createdAt updatedAt";

export type UserManagementData = {
  fullname: string;
  email: string;
  role: string;
  roles: string[];
  active: boolean;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  gender?: string;
  title?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  phone?: string;
  citizenId?: string;
  region?: string;
  province?: string;
  vocationalOffice?: string;
  educationType?: string;
  schoolProvince?: string;
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

  static async addRole(email: string, role: string) {
    await connectDB();
    return User.findOneAndUpdate(
      { email },
      {
        $addToSet: { roles: role },
        $setOnInsert: { role }
      },
      { new: true, runValidators: true }
    );
  }

  static async setRoles(email: string, roles: string[]) {
    await connectDB();
    return User.findOneAndUpdate(
      { email },
      {
        roles,
        role: roles[0]
      },
      { new: true, runValidators: true }
    );
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

  static async findBySchool(schoolId: string) {
    await connectDB();

    if (!mongoose.isValidObjectId(String(schoolId))) {
      return [];
    }

    return User.find({ schoolId })
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async setActiveById(id: string, active: boolean) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) return null;

    return User.findByIdAndUpdate(id, { active }, { new: true }).select(SAFE_USER_FIELDS);
  }

  static async updateLimitedById(id: string, data: Partial<Record<string, any>>) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) return null;

    const allowed: Record<string, unknown> = {};
    // allow only specific fields to be edited by committee
    const keys = [
      "fullname",
      "title",
      "gender",
      "firstNameTh",
      "lastNameTh",
      "firstNameEn",
      "lastNameEn",
      "phone",
      "citizenId",
      "province",
      "region",
      "vocationalOffice",
      "educationType",
      "schoolProvince",
      "schoolId",
      "schoolName",
      "profileImageUrl",
      "profileImagePublicId",
      "roles",
      "role",
      "active"
    ];
    for (const k of keys) {
      if (k in data) allowed[k] = data[k];
    }

    return User.findByIdAndUpdate(id, allowed, { new: true }).select(SAFE_USER_FIELDS);
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
    return User.countDocuments({
      $or: [
        { roles: role },
        { roles: { $exists: false }, role },
        { roles: { $size: 0 }, role }
      ]
    });
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

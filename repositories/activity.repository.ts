import Activity from "@/models/Activity";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export type ActivityAttachmentData = {
  fileId: string;
  name: string;
  contentType: string;
  size: number;
  publicId: string;
  url: string;
  resourceType: "image" | "raw";
  kind: "document" | "image";
};

export type ActivityData = {
  classLevel: string;
  major: string;
  weekNumber: string;
  duration: string;
  topic: string;
  objectives: string;
  activitySteps: string;
  evaluation: string;
  activityResults: string;
  problems: string;
  followUpStudents: string;
  attachments: ActivityAttachmentData[];
  suggestions: string;
  advisorEmail: string;
};

export class ActivityRepository {
  static async findAll() {
    await connectDB();
    return Activity.find()
      .select("-attachments.data")
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();
    return Activity.find({ advisorEmail })
      .select("-attachments.data")
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async findById(id: string) {
    await connectDB();
    if (!mongoose.isValidObjectId(id)) return null;
    return Activity.findById(id).lean();
  }

  static async findByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();
    if (!mongoose.isValidObjectId(id)) return null;
    return Activity.findOne({ _id: id, advisorEmail }).lean();
  }

  static async create(data: ActivityData) {
    await connectDB();
    return Activity.create(data);
  }

  static async updateById(
    id: string,
    data: Partial<ActivityData>
  ) {
    await connectDB();
    return Activity.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  static async updateByIdForAdvisor(
    id: string,
    advisorEmail: string,
    data: Partial<ActivityData>
  ) {
    await connectDB();
    return Activity.findOneAndUpdate(
      { _id: id, advisorEmail },
      data,
      { new: true, runValidators: true }
    );
  }

  static async deleteById(id: string) {
    await connectDB();
    return Activity.findByIdAndDelete(id);
  }

  static async deleteByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();
    return Activity.findOneAndDelete({
      _id: id,
      advisorEmail
    });
  }
}

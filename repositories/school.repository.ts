import School from "@/models/School";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export type SchoolData = {
  name: string;
  vocationalOffice?: string;
  region?: string;
  educationType?: string;
  province?: string;
};

export class SchoolRepository {
  static async create(data: SchoolData) {
    await connectDB();
    return School.create(data);
  }

  static async createMany(data: SchoolData[]) {
    await connectDB();
    const operations = data.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: { $set: item },
        upsert: true
      }
    }));

    if (operations.length === 0) {
      return [];
    }

    await School.bulkWrite(operations, { ordered: false });
    return School.find({ name: { $in: data.map((item) => item.name) } }).lean();
  }

  static async search(query: string) {
    await connectDB();
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");

    return School.find({
      $or: [
        { name: pattern },
        { vocationalOffice: pattern },
        { educationType: pattern },
        { province: pattern },
        { region: pattern }
      ]
    })
      .sort({ name: 1 })
      .limit(50)
      .lean();
  }

  static async distinctValues(field: string, filter: Record<string, string> = {}) {
    await connectDB();
    return School.distinct(field, filter) as Promise<string[]>;
  }

  static async findById(id: string) {
    await connectDB();
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return School.findById(id).lean();
  }

  static async count() {
    await connectDB();
    return School.countDocuments();
  }

  static async findAll() {
    await connectDB();
    return School.find().sort({ province: 1, name: 1 }).lean();
  }
}

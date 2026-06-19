import Major from "@/models/Major";
import { connectDB } from "@/lib/mongodb";

export type MajorData = {
  name: string;
  advisorEmail: string;
};

export class MajorRepository {
  static async findAll() {
    await connectDB();

    return Major.find()
      .sort({
        name: 1
      })
      .lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();

    return Major.find({
      advisorEmail
    })
      .sort({
        name: 1
      })
      .lean();
  }

  static async create(data: MajorData) {
    await connectDB();

    return Major.findOneAndUpdate(
      {
        name: data.name,
        advisorEmail: data.advisorEmail
      },
      data,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
  }
}

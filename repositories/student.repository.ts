import Student from "@/models/Student";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export type StudentData = {
  studentCode: string;
  fullname: string;
  classLevel: string;
  room: string;
  major: string;
  phone: string;
  gender: string;
  birthDate: string;
  weight: string;
  height: string;
  bloodType: string;
  religion: string;
  guardianName: string;
  address: string;
  note: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  advisorEmail: string;
};

export class StudentRepository {
  private static escapeSearch(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  static async findAll() {
    await connectDB();

    return Student.find()
      .sort({
        createdAt: -1
      })
      .lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();

    return Student.find({
      advisorEmail
    })
      .sort({
        createdAt: -1
      })
      .lean();
  }

  static async findById(id: string) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return Student.findById(id).lean();
  }

  static async findByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return Student.findOne({ _id: id, advisorEmail }).lean();
  }

  static async search(query: string, advisorEmail?: string) {
    await connectDB();

    const pattern = new RegExp(this.escapeSearch(query.trim()), "i");
    const filter = {
      ...(advisorEmail ? { advisorEmail } : {}),
      $or: [
        { studentCode: pattern },
        { fullname: pattern }
      ]
    };

    return Student.find(filter)
      .sort({ fullname: 1 })
      .limit(30)
      .lean();
  }

  static async create(data: StudentData) {
    await connectDB();

    return Student.create(data);
  }

  static async updateById(id: string, data: Partial<StudentData>) {
    await connectDB();

    return Student.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    );
  }

  static async updateByIdForAdvisor(
    id: string,
    advisorEmail: string,
    data: Partial<StudentData>
  ) {
    await connectDB();

    return Student.findOneAndUpdate(
      {
        _id: id,
        advisorEmail
      },
      data,
      {
        new: true,
        runValidators: true
      }
    );
  }

  static async deleteById(id: string) {
    await connectDB();

    return Student.findByIdAndDelete(id);
  }

  static async deleteByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();

    return Student.findOneAndDelete({
      _id: id,
      advisorEmail
    });
  }
}

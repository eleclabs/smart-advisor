import Intervention from "@/models/Intervention";
import { connectDB } from "@/lib/mongodb";

export type InterventionData = {
  studentId: string;
  studentName: string;
  studentCode: string;
  classLevel: string;
  problem: string;
  solutions: string[];
  operationPeriod: string;
  advisorName: string;
  groupActivityName: string;
  groupActivityMinutes: string;
  groupActivitySteps: string;
  changeLevel: string;
  resultStatus: string;
  resultSummary: string;
  advisorEmail: string;
};

export class InterventionRepository {
  static async findAll() {
    await connectDB();
    return Intervention.find().sort({ updatedAt: -1 }).lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();
    return Intervention.find({ advisorEmail })
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async create(data: InterventionData) {
    await connectDB();
    return Intervention.create(data);
  }

  static async updateById(id: string, data: Partial<InterventionData>) {
    await connectDB();
    return Intervention.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  static async updateByIdForAdvisor(
    id: string,
    advisorEmail: string,
    data: Partial<InterventionData>
  ) {
    await connectDB();
    return Intervention.findOneAndUpdate(
      { _id: id, advisorEmail },
      data,
      { new: true, runValidators: true }
    );
  }

  static async deleteById(id: string) {
    await connectDB();
    return Intervention.findByIdAndDelete(id);
  }

  static async deleteByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();
    return Intervention.findOneAndDelete({ _id: id, advisorEmail });
  }
}

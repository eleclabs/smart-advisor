import Screening from "@/models/Screening";
import { connectDB } from "@/lib/mongodb";

export type ScreeningData = {
  studentId: string;
  semester: string;
  academicYear: string;
  studentName: string;
  nickname: string;
  classLevel: string;
  studentNumber: string;
  guardianName: string;
  guardianRelationship: string;
  contactPhone: string;
  parentStatus: string;
  livingWith: string;
  livingWithOther: string;
  housingType: string;
  housingOther: string;
  commuteMethods: string[];
  commuteOther: string;
  learningBehavior: string;
  health: string;
  familyIncome: string;
  assistanceNeeds: string[];
  assistanceOther: string;
  advisorSummary: string;
  advisorSummaryOther: string;
  assistanceApproach: string;
  advisorEmail: string;
};

export class ScreeningRepository {
  static async findAll() {
    await connectDB();
    return Screening.find().sort({ updatedAt: -1 }).lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();
    return Screening.find({ advisorEmail })
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async create(data: ScreeningData) {
    await connectDB();
    return Screening.create(data);
  }

  static async updateById(id: string, data: Partial<ScreeningData>) {
    await connectDB();
    return Screening.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  static async updateByIdForAdvisor(
    id: string,
    advisorEmail: string,
    data: Partial<ScreeningData>
  ) {
    await connectDB();
    return Screening.findOneAndUpdate(
      { _id: id, advisorEmail },
      data,
      { new: true, runValidators: true }
    );
  }

  static async deleteById(id: string) {
    await connectDB();
    return Screening.findByIdAndDelete(id);
  }

  static async deleteByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();
    return Screening.findOneAndDelete({ _id: id, advisorEmail });
  }
}

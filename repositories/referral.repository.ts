import Referral from "@/models/Referral";
import { connectDB } from "@/lib/mongodb";

export type FollowUpData = {
  number: string;
  detail: string;
};

export type ReferralData = {
  studentId: string;
  studentName: string;
  classLevel: string;
  studentNumber: string;
  major: string;
  referralTypes: string[];
  internalDestination: string;
  externalDestination: string;
  reasons: string[];
  academicReason: string;
  behaviorReason: string;
  emotionalReason: string;
  familyReason: string;
  otherReason: string;
  problemSummary: string;
  coordinationDate: string;
  agencyName: string;
  contactPerson: string;
  agencyAddress: string;
  coordinationDetails: string;
  operationStatus: string;
  assistanceResult: string;
  followUps: FollowUpData[];
  advisorEmail: string;
};

export class ReferralRepository {
  static async findAll() {
    await connectDB();
    return Referral.find().sort({ updatedAt: -1 }).lean();
  }

  static async findByAdvisor(advisorEmail: string) {
    await connectDB();
    return Referral.find({ advisorEmail }).sort({ updatedAt: -1 }).lean();
  }

  static async create(data: ReferralData) {
    await connectDB();
    return Referral.create(data);
  }

  static async updateById(id: string, data: Partial<ReferralData>) {
    await connectDB();
    return Referral.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  static async updateByIdForAdvisor(
    id: string,
    advisorEmail: string,
    data: Partial<ReferralData>
  ) {
    await connectDB();
    return Referral.findOneAndUpdate(
      { _id: id, advisorEmail },
      data,
      { new: true, runValidators: true }
    );
  }

  static async deleteById(id: string) {
    await connectDB();
    return Referral.findByIdAndDelete(id);
  }

  static async deleteByIdForAdvisor(id: string, advisorEmail: string) {
    await connectDB();
    return Referral.findOneAndDelete({ _id: id, advisorEmail });
  }
}

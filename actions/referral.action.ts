"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";
import {
  ReferralRepository,
  type FollowUpData,
  type ReferralData
} from "@/repositories/referral.repository";

const REFERRAL_PATH = "/dashboard/referral";

async function requireTeacherOrAdmin() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session.user;
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

function values(formData: FormData, name: string) {
  return formData.getAll(name).map(String).map((item) => item.trim()).filter(Boolean);
}

function getFollowUps(formData: FormData): FollowUpData[] {
  const numbers = formData.getAll("followUpNumber").map(String);
  const details = formData.getAll("followUpDetail").map(String);
  const count = Math.max(numbers.length, details.length);

  return Array.from({ length: count }, (_, index) => ({
    number: (numbers[index] || String(index + 1)).trim(),
    detail: (details[index] || "").trim()
  })).filter((item) => item.number || item.detail);
}

function getReferralData(formData: FormData, advisorEmail: string): ReferralData {
  return {
    studentId: value(formData, "studentId"),
    studentName: value(formData, "studentName"),
    classLevel: value(formData, "classLevel"),
    studentNumber: value(formData, "studentNumber"),
    major: value(formData, "major"),
    referralTypes: values(formData, "referralTypes"),
    internalDestination: value(formData, "internalDestination"),
    externalDestination: value(formData, "externalDestination"),
    reasons: values(formData, "reasons"),
    academicReason: value(formData, "academicReason"),
    behaviorReason: value(formData, "behaviorReason"),
    emotionalReason: value(formData, "emotionalReason"),
    familyReason: value(formData, "familyReason"),
    otherReason: value(formData, "otherReason"),
    problemSummary: value(formData, "problemSummary"),
    coordinationDate: value(formData, "coordinationDate"),
    agencyName: value(formData, "agencyName"),
    contactPerson: value(formData, "contactPerson"),
    agencyAddress: value(formData, "agencyAddress"),
    coordinationDetails: value(formData, "coordinationDetails"),
    operationStatus: value(formData, "operationStatus"),
    assistanceResult: value(formData, "assistanceResult"),
    followUps: getFollowUps(formData),
    advisorEmail
  };
}

function assertRequiredFields(data: ReferralData) {
  if (!data.studentId || !data.studentName || data.referralTypes.length === 0) {
    throw new Error("Student and referral type are required.");
  }
}

async function getAccessibleStudent(
  studentId: string,
  role: string | undefined,
  advisorEmail: string
) {
  const student = role === "admin"
    ? await StudentRepository.findById(studentId)
    : await StudentRepository.findByIdForAdvisor(studentId, advisorEmail);

  if (!student) throw new Error("Student not found or access denied.");
  return student as { advisorEmail?: string };
}

export async function createReferralAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const student = await getAccessibleStudent(value(formData, "studentId"), user.role, userEmail);
  const data = getReferralData(
    formData,
    String(student.advisorEmail || userEmail).toLowerCase()
  );

  assertRequiredFields(data);
  await ReferralRepository.create(data);
  revalidatePath(REFERRAL_PATH);
  redirect(REFERRAL_PATH);
}

export async function updateReferralAction(id: string, formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const student = await getAccessibleStudent(value(formData, "studentId"), user.role, userEmail);
  const data = getReferralData(
    formData,
    String(student.advisorEmail || userEmail).toLowerCase()
  );

  assertRequiredFields(data);
  if (user.role === "admin") {
    await ReferralRepository.updateById(id, data);
  } else {
    await ReferralRepository.updateByIdForAdvisor(id, userEmail, data);
  }

  revalidatePath(REFERRAL_PATH);
  redirect(REFERRAL_PATH);
}

export async function deleteReferralAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();

  if (user.role === "admin") await ReferralRepository.deleteById(id);
  else await ReferralRepository.deleteByIdForAdvisor(id, userEmail);

  revalidatePath(REFERRAL_PATH);
  redirect(REFERRAL_PATH);
}

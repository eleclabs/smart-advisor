"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";
import {
  ScreeningRepository,
  type ScreeningData
} from "@/repositories/screening.repository";

const SCREENING_PATH = "/dashboard/screening";

async function requireTeacherOrAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session.user;
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

function values(formData: FormData, name: string) {
  return formData.getAll(name)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function getScreeningData(
  formData: FormData,
  advisorEmail: string
): ScreeningData {
  return {
    studentId: value(formData, "studentId"),
    semester: value(formData, "semester"),
    academicYear: value(formData, "academicYear"),
    studentName: value(formData, "studentName"),
    nickname: value(formData, "nickname"),
    classLevel: value(formData, "classLevel"),
    studentNumber: value(formData, "studentNumber"),
    guardianName: value(formData, "guardianName"),
    guardianRelationship: value(formData, "guardianRelationship"),
    contactPhone: value(formData, "contactPhone"),
    parentStatus: value(formData, "parentStatus"),
    livingWith: value(formData, "livingWith"),
    livingWithOther: value(formData, "livingWithOther"),
    housingType: value(formData, "housingType"),
    housingOther: value(formData, "housingOther"),
    commuteMethods: values(formData, "commuteMethods"),
    learningBehavior: value(formData, "learningBehavior"),
    health: value(formData, "health"),
    familyIncome: value(formData, "familyIncome"),
    assistanceNeeds: values(formData, "assistanceNeeds"),
    advisorSummary: value(formData, "advisorSummary"),
    advisorSummaryOther: value(formData, "advisorSummaryOther"),
    assistanceApproach: value(formData, "assistanceApproach"),
    advisorEmail
  };
}

function assertRequiredFields(data: ScreeningData) {
  if (
    !data.studentId ||
    !data.semester ||
    !data.academicYear ||
    !data.studentName
  ) {
    throw new Error("Student, semester, academic year, and name are required.");
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

  if (!student) {
    throw new Error("Student not found or access denied.");
  }

  return student as { advisorEmail?: string };
}

export async function createScreeningAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const studentId = value(formData, "studentId");
  const student = await getAccessibleStudent(studentId, user.role, userEmail);
  const ownerEmail = String(student.advisorEmail || userEmail).toLowerCase();
  const data = getScreeningData(formData, ownerEmail);

  assertRequiredFields(data);
  await ScreeningRepository.create(data);
  revalidatePath(SCREENING_PATH);
  redirect(SCREENING_PATH);
}

export async function updateScreeningAction(
  id: string,
  formData: FormData
) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const studentId = value(formData, "studentId");
  const student = await getAccessibleStudent(studentId, user.role, userEmail);
  const ownerEmail = String(student.advisorEmail || userEmail).toLowerCase();
  const data = getScreeningData(formData, ownerEmail);

  assertRequiredFields(data);

  if (user.role === "admin") {
    await ScreeningRepository.updateById(id, data);
  } else {
    await ScreeningRepository.updateByIdForAdvisor(id, userEmail, data);
  }

  revalidatePath(SCREENING_PATH);
  redirect(SCREENING_PATH);
}

export async function deleteScreeningAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();

  if (user.role === "admin") {
    await ScreeningRepository.deleteById(id);
  } else {
    await ScreeningRepository.deleteByIdForAdvisor(id, userEmail);
  }

  revalidatePath(SCREENING_PATH);
  redirect(SCREENING_PATH);
}

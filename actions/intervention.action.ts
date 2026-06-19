"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";
import {
  InterventionRepository,
  type InterventionData
} from "@/repositories/intervention.repository";

const INTERVENTION_PATH = "/dashboard/intervention";

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

function getInterventionData(
  formData: FormData,
  advisorEmail: string
): InterventionData {
  return {
    studentId: value(formData, "studentId"),
    studentName: value(formData, "studentName"),
    studentCode: value(formData, "studentCode"),
    classLevel: value(formData, "classLevel"),
    problem: value(formData, "problem"),
    solutions: values(formData, "solutions"),
    operationPeriod: value(formData, "operationPeriod"),
    advisorName: value(formData, "advisorName"),
    groupActivityName: value(formData, "groupActivityName"),
    groupActivityMinutes: value(formData, "groupActivityMinutes"),
    groupActivitySteps: value(formData, "groupActivitySteps"),
    changeLevel: value(formData, "changeLevel"),
    resultStatus: value(formData, "resultStatus"),
    resultSummary: value(formData, "resultSummary"),
    advisorEmail
  };
}

function assertRequiredFields(data: InterventionData) {
  if (!data.studentId || !data.studentName || !data.problem) {
    throw new Error("Student and problem are required.");
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

export async function createInterventionAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const student = await getAccessibleStudent(
    value(formData, "studentId"),
    user.role,
    userEmail
  );
  const ownerEmail = String(student.advisorEmail || userEmail).toLowerCase();
  const data = getInterventionData(formData, ownerEmail);

  assertRequiredFields(data);
  await InterventionRepository.create(data);
  revalidatePath(INTERVENTION_PATH);
  redirect(INTERVENTION_PATH);
}

export async function updateInterventionAction(id: string, formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const student = await getAccessibleStudent(
    value(formData, "studentId"),
    user.role,
    userEmail
  );
  const ownerEmail = String(student.advisorEmail || userEmail).toLowerCase();
  const data = getInterventionData(formData, ownerEmail);

  assertRequiredFields(data);

  if (user.role === "admin") {
    await InterventionRepository.updateById(id, data);
  } else {
    await InterventionRepository.updateByIdForAdvisor(id, userEmail, data);
  }

  revalidatePath(INTERVENTION_PATH);
  redirect(INTERVENTION_PATH);
}

export async function deleteInterventionAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const userEmail = String(user.email || "").trim().toLowerCase();

  if (user.role === "admin") {
    await InterventionRepository.deleteById(id);
  } else {
    await InterventionRepository.deleteByIdForAdvisor(id, userEmail);
  }

  revalidatePath(INTERVENTION_PATH);
  redirect(INTERVENTION_PATH);
}

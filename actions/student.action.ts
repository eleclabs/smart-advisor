"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import {
  StudentRepository,
  type StudentData
} from "@/repositories/student.repository";
import { MajorRepository } from "@/repositories/major.repository";

const STUDENT_PATH = "/dashboard/student";

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

function getStudentData(formData: FormData, advisorEmail: string): StudentData {
  return {
    studentCode: String(formData.get("studentCode") || "").trim(),
    fullname: String(formData.get("fullname") || "").trim(),
    classLevel: String(formData.get("classLevel") || "").trim(),
    room: String(formData.get("room") || "").trim(),
    major: String(formData.get("major") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    gender: String(formData.get("gender") || "").trim(),
    birthDate: String(formData.get("birthDate") || "").trim(),
    weight: String(formData.get("weight") || "").trim(),
    height: String(formData.get("height") || "").trim(),
    bloodType: String(formData.get("bloodType") || "").trim(),
    religion: String(formData.get("religion") || "").trim(),
    guardianName: String(formData.get("guardianName") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    note: String(formData.get("note") || "").trim(),
    advisorEmail
  };
}

function assertRequiredStudentFields(data: StudentData) {
  if (!data.studentCode || !data.fullname || !data.classLevel || !data.major) {
    throw new Error("Student code, full name, class level, and major are required.");
  }

  if (!CLASS_LEVEL_OPTIONS.includes(data.classLevel)) {
    throw new Error("Invalid class level.");
  }
}

export async function createStudentAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const data = getStudentData(formData, advisorEmail);

  assertRequiredStudentFields(data);

  await StudentRepository.create(data);
  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

export async function createMajorAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    throw new Error("Major name is required.");
  }

  await MajorRepository.create({
    name,
    advisorEmail
  });

  revalidatePath(STUDENT_PATH);
  redirect(`${STUDENT_PATH}?mode=add`);
}

export async function updateStudentAction(id: string, formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const data = getStudentData(formData, advisorEmail);

  assertRequiredStudentFields(data);

  if (user.role === "admin") {
    const studentData: Partial<StudentData> = { ...data };
    delete studentData.advisorEmail;
    await StudentRepository.updateById(id, studentData);
  } else {
    await StudentRepository.updateByIdForAdvisor(id, advisorEmail, data);
  }

  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

export async function deleteStudentAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();

  if (user.role === "admin") {
    await StudentRepository.deleteById(id);
  } else {
    await StudentRepository.deleteByIdForAdvisor(id, advisorEmail);
  }

  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

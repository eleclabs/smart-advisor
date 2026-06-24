"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import {
  deleteCloudinaryAsset,
  fileFromFormData,
  uploadToCloudinary
} from "@/lib/cloudinary";
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
  if (!data.studentCode || !data.fullname || !data.classLevel || !data.major || !data.gender) {
    throw new Error("Student code, full name, class level, major, and gender are required.");
  }

  if (!CLASS_LEVEL_OPTIONS.includes(data.classLevel)) {
    throw new Error("Invalid class level.");
  }

  if (data.gender !== "ชาย" && data.gender !== "หญิง") {
    throw new Error("Invalid gender.");
  }
}

export async function createStudentAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const profileImage = await uploadToCloudinary(
    fileFromFormData(formData, "profileImage"),
    {
      folder: "smart-advisor/profiles/students",
      kind: "image",
      profile: true
    }
  );
  const data = {
    ...getStudentData(formData, advisorEmail),
    profileImageUrl: profileImage?.url || "",
    profileImagePublicId: profileImage?.publicId || ""
  };

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
  const current = user.role === "admin"
    ? await StudentRepository.findById(id)
    : await StudentRepository.findByIdForAdvisor(id, advisorEmail);

  if (!current) {
    throw new Error("Student not found or access denied.");
  }

  const currentProfile = current as {
    profileImageUrl?: string;
    profileImagePublicId?: string;
  };
  const profileImage = await uploadToCloudinary(
    fileFromFormData(formData, "profileImage"),
    {
      folder: "smart-advisor/profiles/students",
      kind: "image",
      profile: true
    }
  );
  const removeProfileImage = formData.get("removeProfileImage") === "true";
  const data = {
    ...getStudentData(formData, advisorEmail),
    profileImageUrl: profileImage?.url ||
      (removeProfileImage ? "" : currentProfile.profileImageUrl),
    profileImagePublicId: profileImage?.publicId ||
      (removeProfileImage ? "" : currentProfile.profileImagePublicId)
  };

  assertRequiredStudentFields(data);

  if (user.role === "admin") {
    const studentData: Partial<StudentData> = { ...data };
    delete studentData.advisorEmail;
    await StudentRepository.updateById(id, studentData);
  } else {
    await StudentRepository.updateByIdForAdvisor(id, advisorEmail, data);
  }

  if ((profileImage || removeProfileImage) && currentProfile.profileImagePublicId) {
    await deleteCloudinaryAsset(currentProfile.profileImagePublicId, "image");
  }

  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

export async function deleteStudentAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();

  const student = user.role === "admin"
    ? await StudentRepository.findById(id)
    : await StudentRepository.findByIdForAdvisor(id, advisorEmail);

  if (user.role === "admin") {
    await StudentRepository.deleteById(id);
  } else {
    await StudentRepository.deleteByIdForAdvisor(id, advisorEmail);
  }

  await deleteCloudinaryAsset(
    (student as { profileImagePublicId?: string } | null)?.profileImagePublicId,
    "image"
  );

  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

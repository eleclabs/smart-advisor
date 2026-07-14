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
    citizenId: String(formData.get("citizenId") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    fullname: String(formData.get("fullname") || "").trim(),
    classLevel: String(formData.get("classLevel") || "").trim(),
    room: String(formData.get("room") || "").trim(),
    major: String(formData.get("major") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    age: String(formData.get("age") || "").trim(),
    nickname: String(formData.get("nickname") || "").trim(),
    gender: String(formData.get("gender") || "").trim(),
    birthDate: String(formData.get("birthDate") || "").trim(),
    weight: String(formData.get("weight") || "").trim(),
    height: String(formData.get("height") || "").trim(),
    bloodType: String(formData.get("bloodType") || "").trim(),
    nationality: String(formData.get("nationality") || "").trim(),
    studentType: String(formData.get("studentType") || "").trim(),
    disabilityType: String(formData.get("disabilityType") || "").trim(),
    specialAbility: String(formData.get("specialAbility") || "").trim(),
    chronicDisease: String(formData.get("chronicDisease") || "").trim(),
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

export async function importStudentsAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();

  const file = formData.get("csvFile") as File | null;
  if (!file) throw new Error("CSV file is required.");

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) throw new Error("Empty CSV file.");

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1);
  const items: StudentData[] = rows.map((line) => {
    const cols = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => {
      const val = String(cols[i] || "").trim();
      // map common headers
      if (h === "studentcode" || h === "รหัส" || h === "รหัสผู้เรียน") obj.studentCode = val;
      else if (h === "fullname" || h === "name" || h === "ชื่อ-สกุล" || h === "ชื่อ") obj.fullname = val;
      else if (h === "classlevel" || h === "ชั้น" || h === "ระดับชั้น") obj.classLevel = val;
      else if (h === "major" || h === "สาขา") obj.major = val;
      else if (h === "gender" || h === "เพศ") obj.gender = val;
      else if (h === "birthdate" || h === "birthday" || h === "วันเกิด") obj.birthDate = val;
      else if (h === "studentnumber" || h === "เลขที่") obj.studentNumber = val;
      else if (h === "citizenid" || h === "เลขบัตร" || h === "เลขประจำตัวประชาชน") obj.citizenId = val;
      else if (h === "nickname" || h === "ชื่อเล่น") obj.nickname = val;
    });

    return {
      studentCode: obj.studentCode || `imp-${Math.random().toString(36).slice(2, 9)}`,
      fullname: obj.fullname || "",
      classLevel: obj.classLevel || "",
      room: "",
      major: obj.major || "",
      phone: "",
      gender: obj.gender || "ชาย",
      birthDate: obj.birthDate || "",
      weight: "",
      height: "",
      bloodType: "",
      religion: "",
      guardianName: "",
      address: "",
      note: "",
      advisorEmail,
      citizenId: obj.citizenId || "",
      nickname: obj.nickname || ""
    };
  });

  await StudentRepository.createMany(items);
  revalidatePath(STUDENT_PATH);
  redirect(STUDENT_PATH);
}

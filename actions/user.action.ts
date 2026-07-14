"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUserRole } from "@/lib/roles";
import {
  deleteCloudinaryAsset,
  fileFromFormData,
  uploadToCloudinary
} from "@/lib/cloudinary";
import {
  UserRepository,
  type UserManagementData
} from "@/repositories/user.repository";

const USER_PATH = "/dashboard/users";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session.user;
}

function getUserData(formData: FormData): UserManagementData {
  const roles = formData.getAll("roles")
    .map(String)
    .filter(isUserRole);
  const role = roles[0];

  if (!role || roles.length === 0) {
    throw new Error("Invalid user role.");
  }

  return {
    fullname: String(formData.get("fullname") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    role,
    roles,
    active: String(formData.get("active") || "true") === "true"
  };
}

function assertUserData(data: UserManagementData) {
  if (!data.fullname || !data.email) {
    throw new Error("Full name and email are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("Invalid email address.");
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const data = getUserData(formData);
  const target = await UserRepository.findById(id) as {
    _id: unknown;
    role?: string;
    roles?: string[];
    profileImageUrl?: string;
    profileImagePublicId?: string;
  } | null;

  if (!target) {
    throw new Error("User not found.");
  }

  const isCurrentUser = String(admin.id || "") === String(target._id);
  const targetRoles = target.roles?.length ? target.roles : [target.role || "teacher"];
  if (isCurrentUser && (!data.roles.includes("admin") || !data.active)) {
    throw new Error("You cannot remove your own admin access or disable your account.");
  }

  if (targetRoles.includes("admin") && !data.roles.includes("admin")) {
    const adminCount = await UserRepository.countByRole("admin");
    if (adminCount <= 1) {
      throw new Error("The last administrator role cannot be changed.");
    }
  }

  assertUserData(data);
  const profileImage = await uploadToCloudinary(
    fileFromFormData(formData, "profileImage"),
    {
      folder: "smart-advisor/profiles/users",
      kind: "image",
      profile: true
    }
  );
  const removeProfileImage = formData.get("removeProfileImage") === "true";
  const updateData: UserManagementData = {
    ...data,
    profileImageUrl: profileImage?.url ||
      (removeProfileImage ? "" : target.profileImageUrl),
    profileImagePublicId: profileImage?.publicId ||
      (removeProfileImage ? "" : target.profileImagePublicId)
  };

  await UserRepository.updateById(id, updateData);

  if ((profileImage || removeProfileImage) && target.profileImagePublicId) {
    await deleteCloudinaryAsset(target.profileImagePublicId, "image");
  }
  revalidatePath(USER_PATH);
  redirect(USER_PATH);
}

export async function deleteUserAction(id: string) {
  const admin = await requireAdmin();

  if (String(admin.id || "") === id) {
    throw new Error("You cannot delete your own account.");
  }

  const target = await UserRepository.findById(id) as {
    role?: string;
    roles?: string[];
    profileImagePublicId?: string;
  } | null;

  if (!target) {
    throw new Error("User not found.");
  }

  const targetRoles = target.roles?.length ? target.roles : [target.role || "teacher"];
  if (targetRoles.includes("admin")) {
    const adminCount = await UserRepository.countByRole("admin");
    if (adminCount <= 1) {
      throw new Error("The last administrator cannot be deleted.");
    }
  }

  await UserRepository.deleteById(id);
  await deleteCloudinaryAsset(target.profileImagePublicId, "image");
  revalidatePath(USER_PATH);
  redirect(USER_PATH);
}

export async function approveTeacherAction(id: string) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "committee") {
    redirect("/dashboard");
  }

  // load full approver record to get schoolId
  const approver = await UserRepository.findById(String(session.user.id));
  if (!approver) {
    throw new Error("Approver not found.");
  }

  const target = await UserRepository.findById(id) as { schoolId?: string } | null;
  if (!target) {
    throw new Error("User not found.");
  }

  if (String(target.schoolId || "") !== String(approver.schoolId || "")) {
    throw new Error("You can only approve users from your own school.");
  }

  await UserRepository.setActiveById(id, true);
  revalidatePath("/dashboard/committee");
  redirect("/dashboard/committee");
}

async function requireCommittee() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "committee") redirect("/dashboard");
  return session.user;
}

export async function bulkApproveTeachersAction(formData: FormData) {
  const committee = await requireCommittee();
  const approver = await UserRepository.findById(String(committee.id));
  if (!approver) throw new Error("Approver not found.");

  const ids = formData.getAll("teacherIds").map(String).filter(Boolean);
  if (ids.length === 0) {
    throw new Error("No teachers selected.");
  }

  for (const id of ids) {
    const target = await UserRepository.findById(id) as any | null;
    if (!target) continue;
    if (String(target.schoolId || "") !== String(approver.schoolId || "")) continue;
    const roles = Array.isArray(target.roles) && target.roles.length ? target.roles : [target.role || "teacher"];
    if (!roles.includes("teacher")) continue;
    await UserRepository.setActiveById(id, true);
  }

  revalidatePath("/dashboard/committee");
  redirect("/dashboard/committee");
}

export async function committeeUpdateUserAction(id: string, formData: FormData) {
  const committee = await requireCommittee();

  const approver = await UserRepository.findById(String(committee.id));
  if (!approver) throw new Error("Approver not found.");

  const target = await UserRepository.findById(id) as any | null;
  if (!target) throw new Error("User not found.");

  if (String(target.schoolId || "") !== String(approver.schoolId || "")) {
    throw new Error("You can only edit users from your own school.");
  }

  // prevent editing privileged roles
  const targetRoles = target.roles?.length ? target.roles : [target.role || "teacher"];
  if (targetRoles.includes("admin") || targetRoles.includes("committee")) {
    throw new Error("Cannot edit privileged accounts.");
  }

  const roles = formData.getAll("roles").map(String).filter(isUserRole);
  if (roles.length === 0) {
    throw new Error("Invalid user roles.");
  }
  if (roles.includes("admin")) {
    throw new Error("Cannot assign administrator role.");
  }

  const profileImage = await uploadToCloudinary(
    fileFromFormData(formData, "profileImage"),
    {
      folder: "smart-advisor/profiles/users",
      kind: "image",
      profile: true
    }
  );
  const removeProfileImage = formData.get("removeProfileImage") === "true";

  const rawSchoolId = String(formData.get("schoolId") || "").trim();

  const updateData: Record<string, any> = {
    fullname: String(formData.get("fullname") || target.fullname || "").trim(),
    title: String(formData.get("title") || target.title || "").trim(),
    gender: String(formData.get("gender") || target.gender || "").trim(),
    firstNameTh: String(formData.get("firstNameTh") || target.firstNameTh || "").trim(),
    lastNameTh: String(formData.get("lastNameTh") || target.lastNameTh || "").trim(),
    firstNameEn: String(formData.get("firstNameEn") || target.firstNameEn || "").trim(),
    lastNameEn: String(formData.get("lastNameEn") || target.lastNameEn || "").trim(),
    phone: String(formData.get("phone") || target.phone || "").trim(),
    citizenId: String(formData.get("citizenId") || target.citizenId || "").trim(),
    province: String(formData.get("province") || target.province || "").trim(),
    region: String(formData.get("region") || target.region || "").trim(),
    vocationalOffice: String(formData.get("vocationalOffice") || target.vocationalOffice || "").trim(),
    educationType: String(formData.get("educationType") || target.educationType || "").trim(),
    schoolProvince: String(formData.get("schoolProvince") || target.schoolProvince || "").trim(),
    schoolId: rawSchoolId || target.schoolId || undefined,
    schoolName: String(formData.get("schoolName") || target.schoolName || "").trim(),
    roles,
    role: roles[0],
    active: String(formData.get("active") || "true") === "true",
    profileImageUrl: profileImage?.url || (removeProfileImage ? "" : target.profileImageUrl),
    profileImagePublicId: profileImage?.publicId || (removeProfileImage ? "" : target.profileImagePublicId)
  };

  await UserRepository.updateLimitedById(id, updateData);

  if ((profileImage || removeProfileImage) && target.profileImagePublicId) {
    await deleteCloudinaryAsset(target.profileImagePublicId, "image");
  }

  revalidatePath("/dashboard/committee");
  redirect("/dashboard/committee");
}

export async function committeeDeleteUserAction(id: string) {
  const committee = await requireCommittee();
  const approver = await UserRepository.findById(String(committee.id));
  if (!approver) throw new Error("Approver not found.");

  if (String(approver.id || "") === id) {
    throw new Error("You cannot delete your own account.");
  }

  const target = await UserRepository.findById(id) as any | null;
  if (!target) throw new Error("User not found.");

  if (String(target.schoolId || "") !== String(approver.schoolId || "")) {
    throw new Error("You can only delete users from your own school.");
  }

  const targetRoles = target.roles?.length ? target.roles : [target.role || "teacher"];
  if (targetRoles.includes("admin") || targetRoles.includes("committee")) {
    throw new Error("Cannot delete privileged accounts.");
  }

  await UserRepository.deleteById(id);
  if (target.profileImagePublicId) await deleteCloudinaryAsset(target.profileImagePublicId, "image");
  revalidatePath("/dashboard/committee");
  redirect("/dashboard/committee");
}

async function requireUserSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function updateOwnProfileAction(formData: FormData) {
  const user = await requireUserSession();

  const target = await UserRepository.findById(String(user.id)) as any | null;
  if (!target) throw new Error("User not found.");

  const profileImage = await uploadToCloudinary(
    fileFromFormData(formData, "profileImage"),
    {
      folder: "smart-advisor/profiles/users",
      kind: "image",
      profile: true
    }
  );
  const removeProfileImage = formData.get("removeProfileImage") === "true";

  const updateData: Record<string, any> = {
    fullname: String(formData.get("fullname") || target.fullname || "").trim(),
    title: String(formData.get("title") || target.title || "").trim(),
    firstNameTh: String(formData.get("firstNameTh") || target.firstNameTh || "").trim(),
    lastNameTh: String(formData.get("lastNameTh") || target.lastNameTh || "").trim(),
    firstNameEn: String(formData.get("firstNameEn") || target.firstNameEn || "").trim(),
    lastNameEn: String(formData.get("lastNameEn") || target.lastNameEn || "").trim(),
    phone: String(formData.get("phone") || target.phone || "").trim(),
    citizenId: String(formData.get("citizenId") || target.citizenId || "").trim(),
    region: String(formData.get("region") || target.region || "").trim(),
    province: String(formData.get("province") || target.province || "").trim(),
    vocationalOffice: String(formData.get("vocationalOffice") || target.vocationalOffice || "").trim(),
    educationType: String(formData.get("educationType") || target.educationType || "").trim(),
    schoolProvince: String(formData.get("schoolProvince") || target.schoolProvince || "").trim(),
    schoolId: String(formData.get("schoolId") || target.schoolId || "").trim() || undefined,
    schoolName: String(formData.get("schoolName") || target.schoolName || "").trim(),
    profileImageUrl: profileImage?.url || (removeProfileImage ? "" : target.profileImageUrl),
    profileImagePublicId: profileImage?.publicId || (removeProfileImage ? "" : target.profileImagePublicId)
  };

  await UserRepository.updateById(String(user.id), updateData as any);

  if ((profileImage || removeProfileImage) && target.profileImagePublicId) {
    await deleteCloudinaryAsset(target.profileImagePublicId, "image");
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function deleteOwnAccountAction() {
  const user = await requireUserSession();
  const target = await UserRepository.findById(String(user.id)) as any | null;
  if (!target) throw new Error("User not found.");

  // allow deletion except admin accounts
  const roles = Array.isArray(target.roles) && target.roles.length ? target.roles : [target.role || "teacher"];
  if (roles.includes("admin")) {
    throw new Error("Cannot delete administrator account.");
  }

  await UserRepository.deleteById(String(user.id));
  if (target.profileImagePublicId) await deleteCloudinaryAsset(target.profileImagePublicId, "image");

  revalidatePath("/");
  redirect("/");
}

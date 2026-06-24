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

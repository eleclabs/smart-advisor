"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUserRole } from "@/lib/roles";
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
  const role = String(formData.get("role") || "").trim();

  if (!isUserRole(role)) {
    throw new Error("Invalid user role.");
  }

  return {
    fullname: String(formData.get("fullname") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    role,
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
  } | null;

  if (!target) {
    throw new Error("User not found.");
  }

  const isCurrentUser = String(admin.id || "") === String(target._id);
  if (isCurrentUser && (data.role !== "admin" || !data.active)) {
    throw new Error("You cannot remove your own admin access or disable your account.");
  }

  if (target.role === "admin" && data.role !== "admin") {
    const adminCount = await UserRepository.countByRole("admin");
    if (adminCount <= 1) {
      throw new Error("The last administrator role cannot be changed.");
    }
  }

  assertUserData(data);
  await UserRepository.updateById(id, data);
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
  } | null;

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "admin") {
    const adminCount = await UserRepository.countByRole("admin");
    if (adminCount <= 1) {
      throw new Error("The last administrator cannot be deleted.");
    }
  }

  await UserRepository.deleteById(id);
  revalidatePath(USER_PATH);
  redirect(USER_PATH);
}

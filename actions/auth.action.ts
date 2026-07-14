"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { auth, signIn, signOut, unstable_update } from "@/lib/auth";
import { isUserRole } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
  resetToken?: string;
};

const errorState = (message: string): AuthActionState => ({
  status: "error",
  message
});

function getFormData(
  stateOrFormData: AuthActionState | FormData,
  formData?: FormData
): FormData {
  if (formData) {
    return formData;
  }

  if (stateOrFormData instanceof FormData) {
    return stateOrFormData;
  }

  throw new Error("Form data is required.");
}

export async function registerAction(
  stateOrFormData: AuthActionState | FormData,
  actionFormData?: FormData
): Promise<AuthActionState> {
  const formData = getFormData(stateOrFormData, actionFormData);

  const result = await AuthService.register({
    email: formData.get("email"),
    password: formData.get("password"),
    roles: formData.getAll("roles"),
    gender: formData.get("gender"),
    title: formData.get("title"),
    firstNameTh: formData.get("firstNameTh"),
    lastNameTh: formData.get("lastNameTh"),
    firstNameEn: formData.get("firstNameEn"),
    lastNameEn: formData.get("lastNameEn"),
    phone: formData.get("phone"),
    citizenId: formData.get("citizenId"),
    region: formData.get("region"),
    province: formData.get("province"),
    vocationalOffice: formData.get("vocationalOffice"),
    educationType: formData.get("educationType"),
    schoolProvince: formData.get("schoolProvince"),
    schoolId: formData.get("schoolId"),
    schoolName: formData.get("schoolName")
  });

  if (!result.ok) {
    return errorState(result.message);
  }

  return {
    status: "success",
    message: result.message
  };
}

export async function loginAction(
  stateOrFormData: AuthActionState | FormData,
  actionFormData?: FormData
): Promise<AuthActionState> {
  const formData = getFormData(stateOrFormData, actionFormData);
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  const result = await AuthService.validateCredentials({
    email,
    password,
    role
  });

  if (!result.ok) {
    return errorState(result.message);
  }

  await signIn("credentials", {
    email: String(email),
    password: String(password),
    role: String(role),
    redirectTo: "/dashboard"
  });

  return {
    status: "success",
    message: "เข้าสู่ระบบสำเร็จ"
  };
}

export async function forgotPasswordAction(
  stateOrFormData: AuthActionState | FormData,
  actionFormData?: FormData
): Promise<AuthActionState> {
  const formData = getFormData(stateOrFormData, actionFormData);

  const result = await AuthService.createPasswordResetToken(
    formData.get("email")
  );

  if (!result.ok) {
    return errorState(result.message);
  }

  return {
    status: "success",
    message:
      "สร้างรหัสรีเซ็ตรหัสผ่านแล้ว โปรดนำ token นี้ไปใช้ต่อกับขั้นตอนตั้งรหัสผ่านใหม่",
    resetToken: result.resetToken
  };

}

export async function logoutAction() {
  await signOut({
    redirectTo: "/login"
  });
}

export async function switchRoleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const role = String(formData.get("role") || "");
  if (!isUserRole(role)) {
    throw new Error("Invalid user role.");
  }

  const user = await UserRepository.findByEmail(
    session.user.email.trim().toLowerCase()
  );
  const roles = user ? AuthService.getUserRoles(user) : [];

  if (!roles.includes(role)) {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์ใช้งานบทบาทที่เลือก");
  }

  await unstable_update({
    user: {
      role
    }
  });

  redirect("/dashboard");
}

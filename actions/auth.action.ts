"use server";

import { AuthService } from "@/services/auth.service";
import { signIn, signOut } from "@/lib/auth";

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
    fullname: formData.get("fullname"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  });

  if (!result.ok) {
    return errorState(result.message);
  }

  return {
    status: "success",
    message: "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ"
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

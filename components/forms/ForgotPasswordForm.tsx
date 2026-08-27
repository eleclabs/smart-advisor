"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "@/actions/auth.action";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  return (
    <div className="auth-page">
      <form className="auth-card" action={formAction}>
        <h2>ลืมรหัสผ่าน</h2>
        <p className="auth-help">
          กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะสร้างลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
        </p>

        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          required
        />

        {state.message ? (
          <p
            className={`auth-message auth-message-${state.status}`}
            aria-live="polite"
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending}>
          {pending ? "กำลังส่งอีเมล..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
        </button>

        <p className="auth-help">
          <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}

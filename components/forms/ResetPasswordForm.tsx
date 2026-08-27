"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { resetPasswordAction, type AuthActionState } from "@/actions/auth.action";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => router.push("/login"), 1500);
      return () => clearTimeout(timer);
    }
  }, [router, state.status]);

  return (
    <div className="auth-page">
      <form className="auth-card" action={formAction}>
        <h2>ตั้งรหัสผ่านใหม่</h2>

        <input name="token" type="hidden" defaultValue={token} />

        <label htmlFor="password">รหัสผ่านใหม่</label>
        <input
          id="password"
          name="password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          type="password"
          required
        />

        <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          type="password"
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
          {pending ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
        </button>

        <p className="auth-help">
          <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}

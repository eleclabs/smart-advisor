"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth.action";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <div className="auth-page">
      <form className="auth-card" action={formAction}>
        <h2>เข้าสู่ระบบ</h2>

        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          required
        />

        <label htmlFor="password">รหัสผ่าน</label>
        <input
          id="password"
          name="password"
          placeholder="กรอกรหัสผ่าน"
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
          {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="auth-help">
          ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
        </p>
      </form>
    </div>
  );
}

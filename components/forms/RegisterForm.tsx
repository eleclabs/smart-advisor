"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { registerAction, type AuthActionState } from "@/actions/auth.action";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export default function RegisterForm(){
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      alert(state.message);
      router.push("/login");
    }
  }, [router, state.message, state.status]);

  return(

    <div className="auth-page">
      <form className="auth-card" action={formAction}>
        <h2>สมัครสมาชิก</h2>

        <label htmlFor="fullname">ชื่อ-นามสกุล</label>
        <input
          id="fullname"
          name="fullname"
          placeholder="กรอกชื่อ-นามสกุล"
          required
        />

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
          placeholder="อย่างน้อย 6 ตัวอักษร"
          type="password"
          minLength={6}
          required
        />

        <fieldset className="register-role-fieldset">
          <legend>สิทธิ์การใช้งาน</legend>
          <label>
            <input defaultChecked name="roles" type="checkbox" value="teacher" />
            ครูที่ปรึกษา
          </label>
          <label>
            <input name="roles" type="checkbox" value="committee" />
            หัวหน้างานครูที่ปรึกษา
          </label>
          <label>
            <input name="roles" type="checkbox" value="admin" />
            ผู้บริหาร
          </label>
        </fieldset>
        <p className="register-role-note">
          อีเมลเดิมสามารถสมัครเพิ่มบทบาทได้ โดยใช้รหัสผ่านเดิมของบัญชี
        </p>

        {state.message ? (
          <p
            className={`auth-message auth-message-${state.status}`}
            aria-live="polite"
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending}>
          {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>

        <p className="auth-help">
          มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>

  )

}

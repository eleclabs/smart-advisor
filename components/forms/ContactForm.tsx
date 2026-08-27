"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendHelpRequestAction, type ContactActionState } from "@/actions/contact.action";

const initialState: ContactActionState = {
  status: "idle",
  message: ""
};

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendHelpRequestAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form className="contact-form" ref={formRef} action={formAction}>
      <label>
        ชื่อ-นามสกุล
        <input name="fullname" required />
      </label>

      <label>
        อีเมลสำหรับติดต่อกลับ
        <input name="email" type="email" required />
      </label>

      <label>
        หัวข้อ
        <input name="topic" placeholder="เช่น ปัญหาการเข้าสู่ระบบ" required />
      </label>

      <label>
        รายละเอียดคำขอความช่วยเหลือ
        <textarea name="message" rows={5} required />
      </label>

      {state.message ? (
        <p
          className={`auth-message auth-message-${state.status}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "กำลังส่งคำขอ..." : "ส่งคำขอความช่วยเหลือ"}
      </button>
    </form>
  );
}

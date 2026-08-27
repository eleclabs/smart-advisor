"use server";

import { sendMail } from "@/lib/mailer";
import { UserRepository } from "@/repositories/user.repository";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const errorState = (message: string): ContactActionState => ({
  status: "error",
  message
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendHelpRequestAction(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const fullname = String(formData.get("fullname") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const topic = String(formData.get("topic") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!fullname || !email || !topic || !message) {
    return errorState("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorState("รูปแบบอีเมลไม่ถูกต้อง");
  }

  const safeFullname = escapeHtml(fullname);
  const safeTopic = escapeHtml(topic);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  const adminEmails = await UserRepository.findAdminEmails();

  if (adminEmails.length > 0) {
    await sendMail({
      to: adminEmails,
      subject: `มีคำขอความช่วยเหลือใหม่: ${topic}`,
      html: `<p>ชื่อ: ${safeFullname}<br/>อีเมล: ${escapeHtml(email)}<br/>หัวข้อ: ${safeTopic}</p><p>${safeMessage}</p>`
    });
  }

  await sendMail({
    to: [{ email, name: fullname }],
    subject: "ได้รับคำขอความช่วยเหลือของคุณแล้ว",
    html: `<p>สวัสดีคุณ ${safeFullname},</p><p>ทีมงาน Smart Advisor ได้รับคำขอความช่วยเหลือของคุณเรื่อง "${safeTopic}" แล้ว และจะติดต่อกลับทางอีเมลโดยเร็วที่สุด</p>`
  });

  return {
    status: "success",
    message: "ส่งคำขอความช่วยเหลือเรียบร้อยแล้ว ทีมงานจะติดต่อกลับทางอีเมลโดยเร็วที่สุด"
  };
}

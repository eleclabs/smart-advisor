import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";

const REQUIRED_FIELDS = ["studentCode", "fullname", "classLevel", "major", "gender"];

const GENDER_MAP: Record<string, string> = {
  "ชาย": "ชาย",
  "male": "ชาย",
  "m": "ชาย",
  "หญิง": "หญิง",
  "female": "หญิง",
  "f": "หญิง"
};

function normalizeGender(value: string) {
  return GENDER_MAP[value.trim().toLowerCase()] || "";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) {
    return NextResponse.json({ message: "No rows provided" }, { status: 400 });
  }

  // attach advisorEmail from session for ownership
  const advisorEmail = String(session.user.email || "").trim().toLowerCase();

  const valid: any[] = [];
  const skipped: { row: number; reason: string }[] = [];

  rows.forEach((r: any, index: number) => {
    const item = { ...r, advisorEmail };
    const gender = normalizeGender(String(item.gender || ""));

    const missing = REQUIRED_FIELDS.filter((field) => field === "gender" ? !gender : !String(item[field] || "").trim());
    if (missing.length) {
      skipped.push({ row: index + 1, reason: `ข้อมูลไม่ครบ: ${missing.join(", ")}` });
      return;
    }

    valid.push({ ...item, gender });
  });

  if (!valid.length) {
    return NextResponse.json(
      { message: "ไม่มีแถวข้อมูลที่ถูกต้องให้นำเข้า กรุณาตรวจสอบการแมปคอลัมน์", skipped },
      { status: 400 }
    );
  }

  try {
    const result = await StudentRepository.createMany(valid);
    return NextResponse.json({ ok: true, result, imported: valid.length, skipped });
  } catch (err: any) {
    return NextResponse.json({ message: String(err?.message || err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";

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
  const normalized = rows.map((r: any) => ({ ...r, advisorEmail }));

  try {
    const result = await StudentRepository.createMany(normalized as any[]);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ message: String(err?.message || err) }, { status: 500 });
  }
}

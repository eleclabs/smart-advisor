import { NextResponse } from "next/server";
import { SchoolRepository } from "@/repositories/school.repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json([]);
  }

  const schools = await SchoolRepository.search(q);
  return NextResponse.json(
    schools.map((school) => ({
      id: String(school._id),
      name: school.name || "",
      vocationalOffice: school.vocationalOffice || "",
      region: school.region || "",
      educationType: school.educationType || "",
      province: school.province || ""
    }))
  );
}

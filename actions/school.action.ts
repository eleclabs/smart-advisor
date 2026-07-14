"use server";

import { redirect } from "next/navigation";
import { SchoolRepository } from "@/repositories/school.repository";

export type SchoolActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function mapHeader(header: string) {
  const normalized = header.trim();
  if (normalized.includes("ชื่อสถานศึกษา")) return "name";
  if (normalized.includes("อาชีวศึกษาจังหวัด")) return "vocationalOffice";
  if (normalized === "ภาค") return "region";
  if (normalized.includes("ประเภทสถานศึกษา")) return "educationType";
  if (normalized === "จังหวัด") return "province";
  return null;
}

export async function importSchoolsAction(formData: FormData) {
  const file = formData.get("csvFile");

  if (!file || !(file instanceof File)) {
    redirect("/dashboard/schools?error=" + encodeURIComponent("กรุณาเลือกไฟล์ CSV ที่ถูกต้อง"));
  }

  const text = await file.text();
  const lines = text.replace(/\r/g, "").split("\n").filter((line) => line.trim());

  if (lines.length <= 1) {
    redirect("/dashboard/schools?error=" + encodeURIComponent("ไฟล์ CSV ต้องมีข้อมูลมากกว่า 1 แถว"));
  }

  const headers = parseCsvLine(lines[0]);
  const mappedHeaders = headers.map(mapHeader);

  const schools = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};

    values.forEach((value, index) => {
      const key = mappedHeaders[index];
      if (key) {
        record[key] = value.trim();
      }
    });

    return {
      name: record.name || "",
      vocationalOffice: record.vocationalOffice || "",
      region: record.region || "",
      educationType: record.educationType || "",
      province: record.province || ""
    };
  }).filter((item) => item.name);

  if (schools.length === 0) {
    redirect("/dashboard/schools?error=" + encodeURIComponent("ไม่พบข้อมูลสถานศึกษาในไฟล์ CSV"));
  }

  await SchoolRepository.createMany(schools);

  redirect("/dashboard/schools?imported=" + schools.length);
}

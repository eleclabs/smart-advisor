"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const TARGET_FIELDS = [
  "studentCode",
  "title",
  "fullname",
  "nickname",
  "gender",
  "birthDate",
  "age",
  "citizenId",
  "classLevel",
  "room",
  "major",
  "phone",
  "weight",
  "height",
  "bloodType",
  "nationality",
  "religion",
  "studentType",
  "disabilityType",
  "specialAbility",
  "chronicDisease",
  "guardianName",
  "address",
  "note"
];

const REQUIRED_FIELDS = ["studentCode", "fullname", "classLevel", "major", "gender"];

const HEADER_ALIASES: Record<string, string> = {
  studentcode: "studentCode",
  "รหัส": "studentCode",
  "รหัสผู้เรียน": "studentCode",
  "รหัสนักเรียน": "studentCode",
  title: "title",
  "คำนำหน้า": "title",
  "คำนำหน้านาม": "title",
  fullname: "fullname",
  name: "fullname",
  "ชื่อ-สกุล": "fullname",
  "ชื่อสกุล": "fullname",
  "ชื่อ": "fullname",
  nickname: "nickname",
  "ชื่อเล่น": "nickname",
  gender: "gender",
  "เพศ": "gender",
  birthdate: "birthDate",
  birthday: "birthDate",
  "วันเกิด": "birthDate",
  age: "age",
  "อายุ": "age",
  citizenid: "citizenId",
  "เลขบัตร": "citizenId",
  "เลขบัตรประชาชน": "citizenId",
  "เลขประจำตัวประชาชน": "citizenId",
  classlevel: "classLevel",
  "ชั้น": "classLevel",
  "ระดับชั้น": "classLevel",
  room: "room",
  "ห้อง": "room",
  major: "major",
  "สาขา": "major",
  "สาขาวิชา": "major",
  phone: "phone",
  "เบอร์โทร": "phone",
  "เบอร์โทรศัพท์": "phone",
  "โทรศัพท์": "phone",
  weight: "weight",
  "น้ำหนัก": "weight",
  height: "height",
  "ส่วนสูง": "height",
  bloodtype: "bloodType",
  "กรุ๊ปเลือด": "bloodType",
  "หมู่เลือด": "bloodType",
  nationality: "nationality",
  "สัญชาติ": "nationality",
  religion: "religion",
  "ศาสนา": "religion",
  studenttype: "studentType",
  "ประเภทผู้เรียน": "studentType",
  disabilitytype: "disabilityType",
  "ความพิการ": "disabilityType",
  "ประเภทความพิการ": "disabilityType",
  specialability: "specialAbility",
  "ความสามารถพิเศษ": "specialAbility",
  chronicdisease: "chronicDisease",
  "โรคประจำตัว": "chronicDisease",
  guardianname: "guardianName",
  "ผู้ปกครอง": "guardianName",
  "ชื่อผู้ปกครอง": "guardianName",
  address: "address",
  "ที่อยู่": "address",
  note: "note",
  "หมายเหตุ": "note"
};

function guessMapping(headers: string[]) {
  const mapping: Record<number, string> = {};
  const used = new Set<string>();
  headers.forEach((h, idx) => {
    const field = HEADER_ALIASES[h.trim().toLowerCase()];
    if (field && !used.has(field)) {
      mapping[idx] = field;
      used.add(field);
    }
  });
  return mapping;
}

function sheetToTable(sheet: XLSX.WorkSheet) {
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: "" });
  const rows = matrix
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some((cell) => cell !== ""));
  if (!rows.length) return { headers: [], rows: [] };
  const [headers, ...rest] = rows;
  return { headers, rows: rest };
}

function parseWorkbook(data: ArrayBuffer | string, isCsv: boolean) {
  const workbook = XLSX.read(data, isCsv ? { type: "string" } : { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { headers: [], rows: [] };
  return sheetToTable(workbook.Sheets[firstSheetName]);
}

export default function StudentImport() {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setStatus(null);

    const isCsv = /\.csv$/i.test(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = isCsv
          ? parseWorkbook(String(reader.result || ""), true)
          : parseWorkbook(reader.result as ArrayBuffer, false);
        setHeaders(parsed.headers);
        setRows(parsed.rows.slice(0, 200));
        setMapping(guessMapping(parsed.headers));
      } catch {
        setStatus("ไม่สามารถอ่านไฟล์นี้ได้ กรุณาตรวจสอบรูปแบบไฟล์ (CSV, XLS, XLSX)");
        setHeaders([]);
        setRows([]);
      }
    };

    if (isCsv) {
      reader.readAsText(f, "utf-8");
    } else {
      reader.readAsArrayBuffer(f);
    }
  }

  function setMap(colIndex: number, field: string) {
    setMapping((m) => ({ ...m, [colIndex]: field }));
  }

  async function handleImport() {
    setStatus(null);

    const mappedFields = new Set(Object.values(mapping).filter(Boolean));
    const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.has(f));
    if (missingRequired.length) {
      setStatus(`กรุณาแมปคอลัมน์ที่จำเป็นให้ครบ: ${missingRequired.join(", ")}`);
      return;
    }

    // build mapped objects using current mapping
    const mapped = rows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const field = mapping[idx];
        if (field) obj[field] = r[idx] || "";
      });
      return obj;
    });

    if (!mapped.length) {
      setStatus("ไม่มีข้อมูลให้ import");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mapped })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Import failed");

      const skipped = Array.isArray(data.skipped) ? data.skipped : [];
      const importedCount = typeof data.imported === "number" ? data.imported : mapped.length;
      const skippedNote = skipped.length
        ? ` (ข้าม ${skipped.length} แถวเนื่องจากข้อมูลไม่ครบ: ${skipped.map((s: any) => `แถว ${s.row}`).join(", ")})`
        : "";
      setStatus(`นำเข้าข้อมูลสำเร็จ ${importedCount} รายการ${skippedNote}`);
    } catch (err: any) {
      setStatus(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="management-card student-import">
      <div className="management-section-header">
        <div>
          <h2>นำเข้าข้อมูลผู้เรียนจากไฟล์ CSV / Excel</h2>
          <p>อัปโหลดไฟล์ CSV, XLS หรือ XLSX แล้วแมปคอลัมน์ให้ตรงกับข้อมูลผู้เรียนก่อนนำเข้า</p>
        </div>
      </div>

      <div className="student-import-hint">
        <div className="student-import-template-links">
          <a className="student-import-template-link" href="/templates/student-import-sample.csv" download>
            ดาวน์โหลดไฟล์ตัวอย่าง CSV
          </a>
          <a className="student-import-template-link" href="/templates/student-import-sample.xlsx" download>
            ดาวน์โหลดไฟล์ตัวอย่าง Excel
          </a>
        </div>
        <div className="student-import-fields">
          {TARGET_FIELDS.map((f) => (
            <code key={f}>{f}{REQUIRED_FIELDS.includes(f) ? " *" : ""}</code>
          ))}
        </div>
        <span>* คอลัมน์ที่จำเป็นต้องแมปก่อนนำเข้า</span>
      </div>

      <label className="student-import-dropzone">
        <span className="student-import-dropzone-title">นำเข้าไฟล์ CSV, XLS หรือ XLSX</span>
        <input
          type="file"
          accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileChange}
        />
        <span className="student-import-dropzone-hint">{fileName || "ยังไม่ได้เลือกไฟล์"}</span>
      </label>

      {headers.length ? (
        <div className="student-import-mapping">
          <h4>แมปคอลัมน์</h4>
          <p className="student-import-mapping-hint">
            ระบบแมปคอลัมน์ให้อัตโนมัติจากชื่อหัวตารางที่ตรงกับไฟล์ตัวอย่าง กรุณาตรวจสอบและแก้ไขคอลัมน์ที่มี * ให้ครบก่อนนำเข้า
          </p>
          <div className="student-import-table-wrap">
            <table className="import-mapping-table">
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx}>
                      <div>{h}</div>
                      <select value={mapping[idx] || ""} onChange={(e) => setMap(idx, e.target.value)}>
                        <option value="">-- ไม่ระบุ --</option>
                        {TARGET_FIELDS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                            {REQUIRED_FIELDS.includes(f) ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => (
                      <td key={ci}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="student-import-actions">
            <button className="management-primary-button" disabled={loading} onClick={handleImport} type="button">
              {loading ? "กำลังนำเข้า..." : "นำเข้าตามการแมป"}
            </button>
          </div>

          {status ? (
            <p className={`auth-message ${status.startsWith("นำเข้าข้อมูลสำเร็จ") ? "auth-message-success" : "auth-message-error"}`}>
              {status}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

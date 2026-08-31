"use client";

import { useState } from "react";

const TARGET_FIELDS = [
  "studentCode",
  "fullname",
  "classLevel",
  "room",
  "major",
  "phone",
  "gender",
  "birthDate",
  "citizenId",
  "nickname"
];

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return { headers: [], rows: [] };
  const rawHeaders = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers: rawHeaders, rows };
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
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows.slice(0, 200));
      setMapping({});
    };
    reader.readAsText(f, "utf-8");
  }

  function setMap(colIndex: number, field: string) {
    setMapping((m) => ({ ...m, [colIndex]: field }));
  }

  async function handleImport() {
    setStatus(null);
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
      setStatus("นำเข้าข้อมูลสำเร็จ");
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
          <h2>นำเข้าข้อมูลผู้เรียนจากไฟล์ CSV</h2>
          <p>อัปโหลดไฟล์ CSV แล้วแมปคอลัมน์ให้ตรงกับข้อมูลผู้เรียนก่อนนำเข้า</p>
        </div>
      </div>

      <div className="student-import-hint">
        <span>ไม่แน่ใจว่าไฟล์ CSV ต้องมีคอลัมน์อะไรบ้าง?</span>
        <a className="student-import-template-link" href="/templates/student-import-sample.csv" download>
          ดาวน์โหลดไฟล์ตัวอย่าง (student-import-sample.csv)
        </a>
        <div className="student-import-fields">
          {TARGET_FIELDS.map((f) => (
            <code key={f}>{f}</code>
          ))}
        </div>
      </div>

      <label className="student-import-dropzone">
        <span className="student-import-dropzone-title">นำเข้าไฟล์ CSV</span>
        <input type="file" accept=".csv" onChange={onFileChange} />
        <span className="student-import-dropzone-hint">{fileName || "ยังไม่ได้เลือกไฟล์"}</span>
      </label>

      {headers.length ? (
        <div className="student-import-mapping">
          <h4>แมปคอลัมน์</h4>
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
                          <option key={f} value={f}>{f}</option>
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
            <p className={`auth-message ${status === "นำเข้าข้อมูลสำเร็จ" ? "auth-message-success" : "auth-message-error"}`}>
              {status}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

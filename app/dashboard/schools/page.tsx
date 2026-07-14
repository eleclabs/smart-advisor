import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SchoolRepository } from "@/repositories/school.repository";
import { importSchoolsAction } from "@/actions/school.action";

export default async function SchoolsPage({
  searchParams
}: {
  searchParams?: Promise<{ imported?: string; error?: string }>;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const schools = await SchoolRepository.findAll();
  const count = schools.length;
  const params = (await searchParams) ?? {};
  const importedCount = params.imported ? Number(params.imported) : null;
  const importError = params.error ? decodeURIComponent(params.error) : null;

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">ผู้บริหาร</p>
          <h1>นำเข้าข้อมูลสถานศึกษา</h1>
          <p className="dashboard-description">
            อัปโหลดไฟล์ CSV ของสถานศึกษาอาชีวศึกษารัฐ เพื่อให้ผู้สมัครใช้งานสามารถค้นหาสถานศึกษาของตนเองได้
          </p>
        </div>
        <div className="management-actions">
          <Link href="/dashboard/users">กลับไปหน้าจัดการผู้ใช้งาน</Link>
        </div>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div>
            <h2>นำเข้าไฟล์ CSV</h2>
            <p>ไฟล์ต้องมีหัวข้อ: ชื่อสถานศึกษา, อาชีวศึกษาจังหวัด, ภาค, ประเภทสถานศึกษา, จังหวัด</p>
          </div>
        </div>

        <form className="management-form" action={importSchoolsAction} encType="multipart/form-data">
          {importedCount !== null ? (
            <p className="auth-message auth-message-success">นำเข้าสถานศึกษาเรียบร้อย {importedCount} รายการ</p>
          ) : null}
          {importError ? (
            <p className="auth-message auth-message-error">{importError}</p>
          ) : null}
          <label>
            เลือกไฟล์ CSV
            <input name="csvFile" required type="file" accept=".csv,text/csv" />
          </label>
          <button className="management-primary-button" type="submit">นำเข้าไฟล์</button>
        </form>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div><h2>รายชื่อสถานศึกษาในระบบ</h2><p>{count} รายการ เรียงตามจังหวัด</p></div>
        </div>
        {count === 0 ? (
          <p className="empty-state">ยังไม่มีข้อมูลสถานศึกษา</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ชื่อสถานศึกษา</th>
                  <th>จังหวัด</th>
                  <th>ภาค</th>
                  <th>ประเภท</th>
                  <th>สำนักงานอาชีวศึกษา</th>
                </tr>
              </thead>
              <tbody>
                {(schools as any[]).map((s, i) => (
                  <tr key={String(s._id)}>
                    <td>{i + 1}</td>
                    <td>{s.name || "-"}</td>
                    <td>{s.province || "-"}</td>
                    <td>{s.region || "-"}</td>
                    <td>{s.educationType || "-"}</td>
                    <td>{s.vocationalOffice || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

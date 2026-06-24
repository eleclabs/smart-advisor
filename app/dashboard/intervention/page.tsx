import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createInterventionAction,
  deleteInterventionAction,
  updateInterventionAction
} from "@/actions/intervention.action";
import { auth } from "@/lib/auth";
import { InterventionRepository } from "@/repositories/intervention.repository";
import { StudentRepository } from "@/repositories/student.repository";

type StudentView = {
  id: string;
  studentCode: string;
  fullname: string;
  classLevel: string;
  room: string;
};

type StudentDocument = {
  _id: unknown;
  studentCode?: string;
  fullname?: string;
  classLevel?: string;
  room?: string;
};

type InterventionView = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classLevel: string;
  problem: string;
  solutions: string[];
  operationPeriod: string;
  advisorName: string;
  groupActivityName: string;
  groupActivityMinutes: string;
  groupActivitySteps: string;
  changeLevel: string;
  resultStatus: string;
  resultSummary: string;
};

type InterventionDocument = Partial<Omit<InterventionView, "id" | "studentId">> & {
  _id: unknown;
  studentId?: unknown;
};

type InterventionPageProps = {
  searchParams?: Promise<{
    q?: string;
    mode?: string;
    studentId?: string;
    id?: string;
  }>;
};

function toStudentView(student: StudentDocument): StudentView {
  return {
    id: String(student._id),
    studentCode: student.studentCode || "",
    fullname: student.fullname || "",
    classLevel: student.classLevel || "",
    room: student.room || ""
  };
}

function toInterventionView(record: InterventionDocument): InterventionView {
  return {
    id: String(record._id),
    studentId: String(record.studentId || ""),
    studentName: record.studentName || "",
    studentCode: record.studentCode || "",
    classLevel: record.classLevel || "",
    problem: record.problem || "",
    solutions: record.solutions || [],
    operationPeriod: record.operationPeriod || "",
    advisorName: record.advisorName || "",
    groupActivityName: record.groupActivityName || "",
    groupActivityMinutes: record.groupActivityMinutes || "",
    groupActivitySteps: record.groupActivitySteps || "",
    changeLevel: record.changeLevel || "",
    resultStatus: record.resultStatus || "",
    resultSummary: record.resultSummary || ""
  };
}

function Choice({
  type,
  name,
  value,
  checked
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
}) {
  return (
    <label className="screening-choice">
      <input type={type} name={name} value={value} defaultChecked={checked} />
      <span>{value}</span>
    </label>
  );
}

function InterventionForm({
  action,
  student,
  record,
  defaultAdvisorName,
  buttonLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  student?: StudentView;
  record?: InterventionView;
  defaultAdvisorName: string;
  buttonLabel: string;
}) {
  const studentId = record?.studentId || student?.id || "";
  const studentName = record?.studentName || student?.fullname || "";
  const studentCode = record?.studentCode || student?.studentCode || "";
  const classLevel = record?.classLevel || [student?.classLevel, student?.room]
    .filter(Boolean)
    .join("/");

  return (
    <form className="management-form intervention-form" action={action}>
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="studentCode" value={studentCode} />
      <input type="hidden" name="classLevel" value={classLevel} />

      <fieldset className="screening-section">
        <legend>1. แผนดูแลช่วยเหลือรายบุคคล</legend>
        <div className="form-grid">
          <label>
            ชื่อผู้เรียน
            <input name="studentName" required defaultValue={studentName} />
          </label>
          <label>
            รหัสผู้เรียน / ชั้น
            <input value={`${studentCode || "-"} / ${classLevel || "-"}`} readOnly />
          </label>
        </div>

        <label>
          ปัญหาที่พบ
          <textarea name="problem" rows={4} required defaultValue={record?.problem} />
        </label>

        <div className="screening-question">
          <strong>วิธีการแก้ไข</strong>
          <div className="screening-options">
            {[
              "การให้คำปรึกษาเบื้องต้น",
              "กิจกรรมปรับเปลี่ยนพฤติกรรม",
              "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง",
              "การส่งต่อ"
            ].map((item) => (
              <Choice
                key={item}
                type="checkbox"
                name="solutions"
                value={item}
                checked={record?.solutions.includes(item) || false}
              />
            ))}
          </div>
        </div>

        <div className="form-grid">
          <label>
            ระยะเวลาดำเนินการ
            <input
              name="operationPeriod"
              placeholder="เช่น 1 เดือน"
              defaultValue={record?.operationPeriod}
            />
          </label>
          <label>
            ครูที่ปรึกษา
            <input
              name="advisorName"
              defaultValue={record?.advisorName || defaultAdvisorName}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="screening-section">
        <legend>2. แผนกิจกรรมกลุ่มสัมพันธ์</legend>
        <div className="form-grid">
          <label>
            ชื่อกิจกรรม
            <input name="groupActivityName" defaultValue={record?.groupActivityName} />
          </label>
          <label>
            เวลา (นาที)
            <input
              name="groupActivityMinutes"
              type="number"
              min="1"
              inputMode="numeric"
              defaultValue={record?.groupActivityMinutes}
            />
          </label>
        </div>
        <label>
          ขั้นตอนดำเนินกิจกรรม
          <textarea
            name="groupActivitySteps"
            rows={6}
            defaultValue={record?.groupActivitySteps}
          />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>3. ประเมินผลการช่วยเหลือ</legend>
        <div className="screening-question">
          <strong>ระดับการเปลี่ยนแปลง</strong>
          <div className="screening-options">
            {["ปกติ", "ดีขึ้น", "ส่งต่อ"].map((item) => (
              <Choice
                key={item}
                type="radio"
                name="changeLevel"
                value={item}
                checked={record?.changeLevel === item}
              />
            ))}
          </div>
        </div>
        <div className="screening-question">
          <strong>สรุปผล</strong>
          <div className="screening-options">
            {["ปกติ", "ส่งต่อ"].map((item) => (
              <Choice
                key={item}
                type="radio"
                name="resultStatus"
                value={item}
                checked={record?.resultStatus === item}
              />
            ))}
          </div>
        </div>
        <label>
          รายละเอียดสรุปผล
          <textarea name="resultSummary" rows={5} defaultValue={record?.resultSummary} />
        </label>
      </fieldset>

      <div className="screening-form-actions">
        <button className="management-primary-button" type="submit">
          {buttonLabel}
        </button>
        <Link href="/dashboard/intervention">ยกเลิก</Link>
      </div>
    </form>
  );
}

export default async function InterventionPage({ searchParams }: InterventionPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const query = String(params?.q || "").trim();
  const mode = params?.mode;
  const studentId = params?.studentId;
  const recordId = params?.id;
  const advisorEmail = String(session.user.email || "").trim().toLowerCase();
  const isAdmin = session.user.role === "admin";
  const [studentDocuments, selectedStudentDocument, interventionDocuments] = await Promise.all([
    query ? StudentRepository.search(query, isAdmin ? undefined : advisorEmail) : [],
    studentId
      ? (isAdmin
        ? StudentRepository.findById(studentId)
        : StudentRepository.findByIdForAdvisor(studentId, advisorEmail))
      : null,
    isAdmin
      ? InterventionRepository.findAll()
      : InterventionRepository.findByAdvisor(advisorEmail)
  ]);

  const students = (studentDocuments as StudentDocument[]).map(toStudentView);
  const selectedStudent = selectedStudentDocument
    ? toStudentView(selectedStudentDocument as StudentDocument)
    : undefined;
  const records = (interventionDocuments as InterventionDocument[]).map(toInterventionView);
  const selectedRecord = records.find((record) => record.id === recordId);
  const defaultAdvisorName = session.user.name || "";

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">
            {isAdmin ? "ผู้บริหาร" : "ครูที่ปรึกษา"}
          </p>
          <h1>การป้องกันและแก้ปัญหา</h1>
          <p className="dashboard-description">
            จัดทำแผนช่วยเหลือ ดำเนินกิจกรรม และประเมินผลผู้เรียนอย่างต่อเนื่อง
          </p>
        </div>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div>
            <h2>ค้นหาผู้เรียน</h2>
            <p>ค้นหาด้วยรหัสผู้เรียนหรือชื่อ-นามสกุล</p>
          </div>
        </div>
        <form className="screening-search" method="get">
          <input name="q" defaultValue={query} placeholder="กรอกรหัสหรือชื่อผู้เรียน" />
          <button className="management-primary-button" type="submit">ค้นหา</button>
          {query ? <Link href="/dashboard/intervention">ล้างการค้นหา</Link> : null}
        </form>

        {query ? (
          students.length > 0 ? (
            <div className="student-table-wrap screening-search-results">
              <table className="student-table intervention-search-table">
                <thead>
                  <tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ชั้น</th><th>เลือก</th></tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const selectionParams = new URLSearchParams({
                      mode: "add",
                      studentId: student.id,
                      q: query
                    });
                    return (
                      <tr key={student.id}>
                        <td>{student.studentCode}</td>
                        <td>{student.fullname}</td>
                        <td>{[student.classLevel, student.room].filter(Boolean).join("/")}</td>
                        <td>
                          <Link href={`/dashboard/intervention?${selectionParams.toString()}`}>
                            ดึงข้อมูล
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-state screening-search-results">ไม่พบผู้เรียนที่ค้นหา</p>
        ) : null}
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div><h2>รายการแผนช่วยเหลือ</h2><p>{records.length} รายการ</p></div>
        </div>
        {records.length === 0 ? (
          <p className="empty-state">ยังไม่มีข้อมูลแผนช่วยเหลือ</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table intervention-table">
              <thead>
                <tr>
                  <th>ชื่อผู้เรียน</th><th>ปัญหาที่พบ</th><th>ระยะเวลา</th>
                  <th>การเปลี่ยนแปลง</th><th>สรุปผล</th><th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const deleteAction = deleteInterventionAction.bind(null, record.id);
                  return (
                    <tr key={record.id}>
                      <td>{record.studentName}</td>
                      <td>{record.problem}</td>
                      <td>{record.operationPeriod || "-"}</td>
                      <td>{record.changeLevel || "-"}</td>
                      <td>{record.resultStatus || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/intervention?mode=edit&id=${record.id}`}>
                            แก้ไข
                          </Link>
                          <form action={deleteAction}><button type="submit">ลบ</button></form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mode === "add" && selectedStudent ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>เพิ่มแผนช่วยเหลือ</h2>
              <p>{selectedStudent.studentCode} - {selectedStudent.fullname}</p>
            </div>
          </div>
          <InterventionForm
            action={createInterventionAction}
            student={selectedStudent}
            defaultAdvisorName={defaultAdvisorName}
            buttonLabel="บันทึกแผนช่วยเหลือ"
          />
        </div>
      ) : null}

      {mode === "edit" && selectedRecord ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>แก้ไขแผนช่วยเหลือ</h2><p>{selectedRecord.studentName}</p></div>
          </div>
          <InterventionForm
            action={updateInterventionAction.bind(null, selectedRecord.id)}
            record={selectedRecord}
            defaultAdvisorName={defaultAdvisorName}
            buttonLabel="บันทึกการแก้ไข"
          />
        </div>
      ) : null}

      {mode === "add" && studentId && !selectedStudent ? (
        <p className="empty-state">ไม่พบผู้เรียนหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
      {mode === "edit" && recordId && !selectedRecord ? (
        <p className="empty-state">ไม่พบแผนช่วยเหลือหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
    </section>
  );
}

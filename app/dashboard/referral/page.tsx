import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createReferralAction,
  deleteReferralAction,
  updateReferralAction
} from "@/actions/referral.action";
import FollowUpFields, { type FollowUpValue } from "@/components/referral/FollowUpFields";
import { auth } from "@/lib/auth";
import { ReferralRepository } from "@/repositories/referral.repository";
import { StudentRepository } from "@/repositories/student.repository";

type StudentView = {
  id: string;
  studentCode: string;
  fullname: string;
  classLevel: string;
  room: string;
  major: string;
};

type StudentDocument = {
  _id: unknown;
  studentCode?: string;
  fullname?: string;
  classLevel?: string;
  room?: string;
  major?: string;
};

type ReferralView = {
  id: string;
  studentId: string;
  studentName: string;
  classLevel: string;
  studentNumber: string;
  major: string;
  referralTypes: string[];
  internalDestination: string;
  externalDestination: string;
  reasons: string[];
  academicReason: string;
  behaviorReason: string;
  emotionalReason: string;
  familyReason: string;
  otherReason: string;
  problemSummary: string;
  coordinationDate: string;
  agencyName: string;
  contactPerson: string;
  agencyAddress: string;
  coordinationDetails: string;
  operationStatus: string;
  assistanceResult: string;
  followUps: FollowUpValue[];
};

type ReferralDocument = Partial<Omit<ReferralView, "id" | "studentId">> & {
  _id: unknown;
  studentId?: unknown;
};

type ReferralPageProps = {
  searchParams?: Promise<{ q?: string; mode?: string; studentId?: string; id?: string }>;
};

function toStudentView(student: StudentDocument): StudentView {
  return {
    id: String(student._id),
    studentCode: student.studentCode || "",
    fullname: student.fullname || "",
    classLevel: student.classLevel || "",
    room: student.room || "",
    major: student.major || ""
  };
}

function toReferralView(record: ReferralDocument): ReferralView {
  return {
    id: String(record._id),
    studentId: String(record.studentId || ""),
    studentName: record.studentName || "",
    classLevel: record.classLevel || "",
    studentNumber: record.studentNumber || "",
    major: record.major || "",
    referralTypes: record.referralTypes || [],
    internalDestination: record.internalDestination || "",
    externalDestination: record.externalDestination || "",
    reasons: record.reasons || [],
    academicReason: record.academicReason || "",
    behaviorReason: record.behaviorReason || "",
    emotionalReason: record.emotionalReason || "",
    familyReason: record.familyReason || "",
    otherReason: record.otherReason || "",
    problemSummary: record.problemSummary || "",
    coordinationDate: record.coordinationDate || "",
    agencyName: record.agencyName || "",
    contactPerson: record.contactPerson || "",
    agencyAddress: record.agencyAddress || "",
    coordinationDetails: record.coordinationDetails || "",
    operationStatus: record.operationStatus || "",
    assistanceResult: record.assistanceResult || "",
    followUps: record.followUps || []
  };
}

function Choice({ name, value, checked }: { name: string; value: string; checked: boolean }) {
  return (
    <label className="screening-choice">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} />
      <span>{value}</span>
    </label>
  );
}

function ReasonField({
  label,
  detailName,
  checked,
  detail
}: {
  label: string;
  detailName: string;
  checked: boolean;
  detail: string;
}) {
  return (
    <div className="referral-reason-row">
      <Choice name="reasons" value={label} checked={checked} />
      <input name={detailName} defaultValue={detail} placeholder="ระบุรายละเอียด" />
    </div>
  );
}

function ReferralForm({
  action,
  student,
  record,
  buttonLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  student?: StudentView;
  record?: ReferralView;
  buttonLabel: string;
}) {
  const studentId = record?.studentId || student?.id || "";
  const studentName = record?.studentName || student?.fullname || "";
  const classLevel = record?.classLevel || [student?.classLevel, student?.room]
    .filter(Boolean)
    .join("/");
  const major = record?.major || student?.major || "";

  return (
    <form className="management-form referral-form" action={action}>
      <input type="hidden" name="studentId" value={studentId} />

      <fieldset className="screening-section">
        <legend>1. ข้อมูลและรายละเอียดการส่งต่อ</legend>
        <div className="form-grid">
          <label>
            ชื่อ-นามสกุล
            <input name="studentName" required defaultValue={studentName} />
          </label>
          <label>
            ชั้น
            <input name="classLevel" defaultValue={classLevel} />
          </label>
          <label>
            เลขที่
            <input name="studentNumber" defaultValue={record?.studentNumber} />
          </label>
          <label>
            สาขา
            <input name="major" defaultValue={major} />
          </label>
        </div>

        <div className="screening-question">
          <strong>ประเภทการส่งต่อ</strong>
          <div className="referral-type-grid">
            <div>
              <Choice
                name="referralTypes"
                value="ภายในสถานศึกษา"
                checked={record?.referralTypes.includes("ภายในสถานศึกษา") || false}
              />
              <input
                name="internalDestination"
                placeholder="ระบุฝ่าย บุคคล หรือหน่วยงานภายใน"
                defaultValue={record?.internalDestination}
              />
            </div>
            <div>
              <Choice
                name="referralTypes"
                value="ภายนอกสถานศึกษา"
                checked={record?.referralTypes.includes("ภายนอกสถานศึกษา") || false}
              />
              <input
                name="externalDestination"
                placeholder="ระบุหน่วยงานภายนอก"
                defaultValue={record?.externalDestination}
              />
            </div>
          </div>
        </div>

        <div className="screening-question">
          <strong>สาเหตุการส่งต่อ</strong>
          <div className="referral-reasons">
            <ReasonField label="ด้านการเรียน" detailName="academicReason" checked={record?.reasons.includes("ด้านการเรียน") || false} detail={record?.academicReason || ""} />
            <ReasonField label="ด้านพฤติกรรม" detailName="behaviorReason" checked={record?.reasons.includes("ด้านพฤติกรรม") || false} detail={record?.behaviorReason || ""} />
            <ReasonField label="ด้านอารมณ์และจิตใจ" detailName="emotionalReason" checked={record?.reasons.includes("ด้านอารมณ์และจิตใจ") || false} detail={record?.emotionalReason || ""} />
            <ReasonField label="ด้านครอบครัว" detailName="familyReason" checked={record?.reasons.includes("ด้านครอบครัว") || false} detail={record?.familyReason || ""} />
            <ReasonField label="อื่นๆ" detailName="otherReason" checked={record?.reasons.includes("อื่นๆ") || false} detail={record?.otherReason || ""} />
          </div>
        </div>

        <label>
          สรุปปัญหา/พฤติกรรมที่พบ
          <textarea name="problemSummary" rows={5} defaultValue={record?.problemSummary} />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>2. บันทึกการประสานงานเครือข่าย</legend>
        <div className="form-grid">
          <label>
            วันที่
            <input type="date" name="coordinationDate" defaultValue={record?.coordinationDate} />
          </label>
          <label>
            ชื่อหน่วยงาน
            <input name="agencyName" defaultValue={record?.agencyName} />
          </label>
          <label>
            บุคคลที่ประสานงาน
            <input name="contactPerson" defaultValue={record?.contactPerson} />
          </label>
          <label>
            ที่อยู่
            <input name="agencyAddress" defaultValue={record?.agencyAddress} />
          </label>
        </div>
        <label>
          รายละเอียดการประสานงาน
          <textarea name="coordinationDetails" rows={5} defaultValue={record?.coordinationDetails} />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>3. ติดตามผลหลังการส่งต่อ</legend>
        <div className="screening-question">
          <strong>สถานะการดำเนินการ</strong>
          <div className="screening-options">
            {["อยู่ระหว่างการดำเนินการ", "สิ้นสุดการดำเนินการ"].map((item) => (
              <label className="screening-choice" key={item}>
                <input
                  type="radio"
                  name="operationStatus"
                  value={item}
                  defaultChecked={record?.operationStatus === item}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <label>
          ผลการช่วยเหลือจากหน่วยงานรับส่งต่อ
          <textarea name="assistanceResult" rows={5} defaultValue={record?.assistanceResult} />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>4. การติดตามผล</legend>
        <p className="referral-section-help">
          เพิ่มจำนวนครั้งและบันทึกรายละเอียดการติดตามได้ตามจริง
        </p>
        <FollowUpFields initialValues={record?.followUps || []} />
      </fieldset>

      <div className="screening-form-actions">
        <button className="management-primary-button" type="submit">{buttonLabel}</button>
        <Link href="/dashboard/referral">ยกเลิก</Link>
      </div>
    </form>
  );
}

export default async function ReferralPage({ searchParams }: ReferralPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
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
  const [studentDocuments, selectedStudentDocument, referralDocuments] = await Promise.all([
    query ? StudentRepository.search(query, isAdmin ? undefined : advisorEmail) : [],
    studentId
      ? (isAdmin
        ? StudentRepository.findById(studentId)
        : StudentRepository.findByIdForAdvisor(studentId, advisorEmail))
      : null,
    isAdmin ? ReferralRepository.findAll() : ReferralRepository.findByAdvisor(advisorEmail)
  ]);

  const students = (studentDocuments as StudentDocument[]).map(toStudentView);
  const selectedStudent = selectedStudentDocument
    ? toStudentView(selectedStudentDocument as StudentDocument)
    : undefined;
  const referrals = (referralDocuments as ReferralDocument[]).map(toReferralView);
  const selectedReferral = referrals.find((record) => record.id === recordId);

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">{isAdmin ? "ผู้ดูแลระบบ" : "ครูที่ปรึกษา"}</p>
          <h1>การส่งต่อผู้เรียน</h1>
          <p className="dashboard-description">
            บันทึกการส่งต่อ การประสานงาน และติดตามผลการช่วยเหลืออย่างต่อเนื่อง
          </p>
        </div>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div><h2>ค้นหาผู้เรียน</h2><p>ค้นหาด้วยรหัสผู้เรียนหรือชื่อ-นามสกุล</p></div>
        </div>
        <form className="screening-search" method="get">
          <input name="q" defaultValue={query} placeholder="กรอกรหัสหรือชื่อผู้เรียน" />
          <button className="management-primary-button" type="submit">ค้นหา</button>
          {query ? <Link href="/dashboard/referral">ล้างการค้นหา</Link> : null}
        </form>
        {query ? (
          students.length > 0 ? (
            <div className="student-table-wrap screening-search-results">
              <table className="student-table referral-search-table">
                <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ชั้น</th><th>สาขา</th><th>เลือก</th></tr></thead>
                <tbody>
                  {students.map((student) => {
                    const selectionParams = new URLSearchParams({ mode: "add", studentId: student.id, q: query });
                    return (
                      <tr key={student.id}>
                        <td>{student.studentCode}</td><td>{student.fullname}</td>
                        <td>{[student.classLevel, student.room].filter(Boolean).join("/")}</td>
                        <td>{student.major}</td>
                        <td><Link href={`/dashboard/referral?${selectionParams.toString()}`}>ดึงข้อมูล</Link></td>
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
          <div><h2>รายการส่งต่อ</h2><p>{referrals.length} รายการ</p></div>
        </div>
        {referrals.length === 0 ? (
          <p className="empty-state">ยังไม่มีข้อมูลการส่งต่อ</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table referral-table">
              <thead>
                <tr><th>ชื่อผู้เรียน</th><th>ประเภท</th><th>หน่วยงาน</th><th>สถานะ</th><th>ติดตาม</th><th>จัดการ</th></tr>
              </thead>
              <tbody>
                {referrals.map((record) => {
                  const deleteAction = deleteReferralAction.bind(null, record.id);
                  const destination = record.externalDestination || record.internalDestination || "-";
                  return (
                    <tr key={record.id}>
                      <td>{record.studentName}</td>
                      <td>{record.referralTypes.join(", ") || "-"}</td>
                      <td>{destination}</td>
                      <td>{record.operationStatus || "-"}</td>
                      <td>{record.followUps.length} ครั้ง</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/referral?mode=edit&id=${record.id}`}>แก้ไข</Link>
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
            <div><h2>เพิ่มข้อมูลการส่งต่อ</h2><p>{selectedStudent.studentCode} - {selectedStudent.fullname}</p></div>
          </div>
          <ReferralForm action={createReferralAction} student={selectedStudent} buttonLabel="บันทึกการส่งต่อ" />
        </div>
      ) : null}

      {mode === "edit" && selectedReferral ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>แก้ไขข้อมูลการส่งต่อ</h2><p>{selectedReferral.studentName}</p></div>
          </div>
          <ReferralForm
            action={updateReferralAction.bind(null, selectedReferral.id)}
            record={selectedReferral}
            buttonLabel="บันทึกการแก้ไข"
          />
        </div>
      ) : null}

      {mode === "add" && studentId && !selectedStudent ? (
        <p className="empty-state">ไม่พบผู้เรียนหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
      {mode === "edit" && recordId && !selectedReferral ? (
        <p className="empty-state">ไม่พบข้อมูลการส่งต่อหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
    </section>
  );
}

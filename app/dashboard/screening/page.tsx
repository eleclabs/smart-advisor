import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createScreeningAction,
  deleteScreeningAction,
  updateScreeningAction
} from "@/actions/screening.action";
import { auth } from "@/lib/auth";
import { StudentRepository } from "@/repositories/student.repository";
import { ScreeningRepository } from "@/repositories/screening.repository";

type StudentView = {
  id: string;
  studentCode: string;
  fullname: string;
  classLevel: string;
  room: string;
  guardianName: string;
  phone: string;
};

type StudentDocument = {
  _id: unknown;
  studentCode?: string;
  fullname?: string;
  classLevel?: string;
  room?: string;
  guardianName?: string;
  phone?: string;
};

type ScreeningView = {
  id: string;
  studentId: string;
  semester: string;
  academicYear: string;
  studentName: string;
  nickname: string;
  classLevel: string;
  studentNumber: string;
  guardianName: string;
  guardianRelationship: string;
  contactPhone: string;
  parentStatus: string;
  livingWith: string;
  livingWithOther: string;
  housingType: string;
  housingOther: string;
  commuteMethods: string[];
  commuteOther: string;
  learningBehavior: string;
  health: string;
  familyIncome: string;
  assistanceNeeds: string[];
  assistanceOther: string;
  advisorSummary: string;
  advisorSummaryOther: string;
  assistanceApproach: string;
};

type ScreeningDocument = Partial<Omit<ScreeningView, "id" | "studentId">> & {
  _id: unknown;
  studentId?: unknown;
};

type ScreeningPageProps = {
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
    room: student.room || "",
    guardianName: student.guardianName || "",
    phone: student.phone || ""
  };
}

function toScreeningView(record: ScreeningDocument): ScreeningView {
  return {
    id: String(record._id),
    studentId: String(record.studentId || ""),
    semester: record.semester || "",
    academicYear: record.academicYear || "",
    studentName: record.studentName || "",
    nickname: record.nickname || "",
    classLevel: record.classLevel || "",
    studentNumber: record.studentNumber || "",
    guardianName: record.guardianName || "",
    guardianRelationship: record.guardianRelationship || "",
    contactPhone: record.contactPhone || "",
    parentStatus: record.parentStatus || "",
    livingWith: record.livingWith || "",
    livingWithOther: record.livingWithOther || "",
    housingType: record.housingType || "",
    housingOther: record.housingOther || "",
    commuteMethods: record.commuteMethods || [],
    commuteOther: record.commuteOther || "",
    learningBehavior: record.learningBehavior || "",
    health: record.health || "",
    familyIncome: record.familyIncome || "",
    assistanceNeeds: record.assistanceNeeds || [],
    assistanceOther: record.assistanceOther || "",
    advisorSummary: record.advisorSummary || "",
    advisorSummaryOther: record.advisorSummaryOther || "",
    assistanceApproach: record.assistanceApproach || ""
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

function ScreeningForm({
  action,
  student,
  record,
  buttonLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  student?: StudentView;
  record?: ScreeningView;
  buttonLabel: string;
}) {
  const studentId = record?.studentId || student?.id || "";
  const studentName = record?.studentName || student?.fullname || "";
  const classLevel = record?.classLevel || [student?.classLevel, student?.room]
    .filter(Boolean)
    .join("/");

  return (
    <form className="management-form screening-form" action={action}>
      <input type="hidden" name="studentId" value={studentId} />

      <div className="screening-term-grid">
        <label>
          ภาคเรียนที่
          <select name="semester" required defaultValue={record?.semester || ""}>
            <option value="" disabled>เลือกภาคเรียน</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="ฤดูร้อน">ฤดูร้อน</option>
          </select>
        </label>
        <label>
          ปีการศึกษา
          <input
            name="academicYear"
            required
            inputMode="numeric"
            placeholder="เช่น 2569"
            defaultValue={record?.academicYear}
          />
        </label>
      </div>

      <fieldset className="screening-section">
        <legend>1. ข้อมูลทั่วไป</legend>
        <div className="form-grid">
          <label>
            ชื่อ-นามสกุล (ผู้เรียน)
            <input name="studentName" required defaultValue={studentName} />
          </label>
          <label>
            ชื่อเล่น
            <input name="nickname" defaultValue={record?.nickname} />
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
            ผู้ปกครอง
            <input
              name="guardianName"
              defaultValue={record?.guardianName || student?.guardianName}
            />
          </label>
          <label>
            ความสัมพันธ์
            <input
              name="guardianRelationship"
              defaultValue={record?.guardianRelationship}
            />
          </label>
          <label>
            เบอร์โทรศัพท์ติดต่อ
            <input
              name="contactPhone"
              type="tel"
              defaultValue={record?.contactPhone || student?.phone}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="screening-section">
        <legend>2. สถานภาพครอบครัว</legend>
        <div className="screening-question">
          <strong>สถานภาพบิดา-มารดา</strong>
          <div className="screening-options">
            {["อยู่ด้วยกัน", "แยกกันอยู่", "หย่าร้าง", "บิดา/มารดาเสียชีวิต"].map((item) => (
              <Choice
                key={item}
                type="radio"
                name="parentStatus"
                value={item}
                checked={record?.parentStatus === item}
              />
            ))}
          </div>
        </div>

        <div className="screening-question">
          <strong>ผู้เรียนพักอาศัยกับ</strong>
          <div className="screening-options">
            {["บิดา-มารดา", "บุคคลอื่น"].map((item) => (
              <Choice
                key={item}
                type="radio"
                name="livingWith"
                value={item}
                checked={record?.livingWith === item}
              />
            ))}
          </div>
          <label>
            บุคคลอื่น (ระบุ)
            <input name="livingWithOther" defaultValue={record?.livingWithOther} />
          </label>
        </div>

        <div className="screening-question">
          <strong>ลักษณะที่อยู่อาศัย</strong>
          <div className="screening-options">
            {["บ้านตนเอง", "บ้านเช่า", "หอพัก", "อื่นๆ"].map((item) => (
              <Choice
                key={item}
                type="radio"
                name="housingType"
                value={item}
                checked={record?.housingType === item}
              />
            ))}
          </div>
          <label>
            อื่นๆ (ระบุ)
            <input name="housingOther" defaultValue={record?.housingOther} />
          </label>
        </div>

        <div className="screening-question">
          <strong>การเดินทางมาสถานศึกษา</strong>
          <div className="screening-options">
            {["รถส่วนตัว", "รถรับส่ง", "รถเมล์/รถสาธารณะ", "อื่น"].map((item) => (
              <Choice
                key={item}
                type="checkbox"
                name="commuteMethods"
                value={item}
                checked={record?.commuteMethods.includes(item) || false}
              />
            ))}
          </div>
          <label>
            อื่น (ระบุ)
            <input
              name="commuteOther"
              placeholder="ระบุวิธีการเดินทาง"
              defaultValue={record?.commuteOther}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="screening-section">
        <legend>3. ด้านการเรียนและพฤติกรรม</legend>
        <textarea
          name="learningBehavior"
          rows={4}
          placeholder="บันทึกผลการเรียน ความสนใจ พฤติกรรม และข้อสังเกต"
          defaultValue={record?.learningBehavior}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>4. ด้านสุขภาพ</legend>
        <textarea
          name="health"
          rows={4}
          placeholder="บันทึกข้อมูลสุขภาพ โรคประจำตัว หรือข้อควรระวัง"
          defaultValue={record?.health}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>5. ด้านรายได้ครอบครัว</legend>
        <label>
          รายได้ครอบครัว
          <select name="familyIncome" defaultValue={record?.familyIncome || ""}>
            <option value="">ไม่ระบุ</option>
            <option value="ต่ำกว่า 10,000">ต่ำกว่า 10,000</option>
            <option value="10,000-30,000">10,000-30,000</option>
            <option value="30,000-40,000">30,000-40,000</option>
            <option value="40,000-50,000">40,000-50,000</option>
            <option value="มากกว่า 50,000">มากกว่า 50,000</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>6. ความต้องการความช่วยเหลือ</legend>
        <div className="screening-options">
          {["ทุนการศึกษา", "อุปกรณ์การเรียน", "เครื่องแบบนักเรียน", "อื่นๆ"].map((item) => (
            <Choice
              key={item}
              type="checkbox"
              name="assistanceNeeds"
              value={item}
              checked={record?.assistanceNeeds.includes(item) || false}
            />
          ))}
        </div>
        <label>
          อื่นๆ (ระบุ)
          <input
            name="assistanceOther"
            placeholder="ระบุความช่วยเหลือที่ต้องการ"
            defaultValue={record?.assistanceOther}
          />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>7. สรุปความเห็นของครูที่ปรึกษา</legend>
        <div className="screening-options">
          {["กลุ่มปกติ", "กลุ่มเสี่ยง", "อื่นๆ"].map((item) => (
            <Choice
              key={item}
              type="radio"
              name="advisorSummary"
              value={item}
              checked={record?.advisorSummary === item}
            />
          ))}
        </div>
        <label>
          อื่นๆ (ระบุ)
          <input name="advisorSummaryOther" defaultValue={record?.advisorSummaryOther} />
        </label>
      </fieldset>

      <fieldset className="screening-section">
        <legend>8. แนวทางการช่วยเหลือ/ส่งต่อ</legend>
        <textarea
          name="assistanceApproach"
          rows={5}
          placeholder="ระบุแนวทาง ผู้รับผิดชอบ หรือหน่วยงานที่ส่งต่อ"
          defaultValue={record?.assistanceApproach}
        />
      </fieldset>

      <div className="screening-form-actions">
        <button className="management-primary-button" type="submit">
          {buttonLabel}
        </button>
        <Link href="/dashboard/screening">ยกเลิก</Link>
      </div>
    </form>
  );
}

export default async function ScreeningPage({ searchParams }: ScreeningPageProps) {
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

  const [studentResults, selectedStudentDocument, screeningDocuments] = await Promise.all([
    query ? StudentRepository.search(query, isAdmin ? undefined : advisorEmail) : [],
    studentId
      ? (isAdmin
        ? StudentRepository.findById(studentId)
        : StudentRepository.findByIdForAdvisor(studentId, advisorEmail))
      : null,
    isAdmin
      ? ScreeningRepository.findAll()
      : ScreeningRepository.findByAdvisor(advisorEmail)
  ]);

  const students = (studentResults as StudentDocument[]).map(toStudentView);
  const selectedStudent = selectedStudentDocument
    ? toStudentView(selectedStudentDocument as StudentDocument)
    : undefined;
  const records = (screeningDocuments as ScreeningDocument[]).map(toScreeningView);
  const selectedRecord = records.find((record) => record.id === recordId);

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">
            {isAdmin ? "ผู้บริหาร" : "ครูที่ปรึกษา"}
          </p>
          <h1>การคัดกรองผู้เรียน</h1>
          <p className="dashboard-description">
            ค้นหาและเลือกผู้เรียนเพื่อบันทึกข้อมูลคัดกรองรายภาคเรียน
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
          <input
            name="q"
            defaultValue={query}
            placeholder="กรอกรหัสหรือชื่อผู้เรียน"
          />
          <button className="management-primary-button" type="submit">ค้นหา</button>
          {query ? <Link href="/dashboard/screening">ล้างการค้นหา</Link> : null}
        </form>

        {query ? (
          students.length > 0 ? (
            <div className="student-table-wrap screening-search-results">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ชั้น</th>
                    <th>เลือก</th>
                  </tr>
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
                          <Link href={`/dashboard/screening?${selectionParams.toString()}`}>
                            ดึงข้อมูล
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state screening-search-results">ไม่พบผู้เรียนที่ค้นหา</p>
          )
        ) : null}
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div>
            <h2>รายการคัดกรอง</h2>
            <p>{records.length} รายการ</p>
          </div>
        </div>
        {records.length === 0 ? (
          <p className="empty-state">ยังไม่มีข้อมูลการคัดกรอง</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table screening-table">
              <thead>
                <tr>
                  <th>ชื่อผู้เรียน</th>
                  <th>ชั้น</th>
                  <th>ภาคเรียน</th>
                  <th>ปีการศึกษา</th>
                  <th>ผลสรุป</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const deleteAction = deleteScreeningAction.bind(null, record.id);
                  return (
                    <tr key={record.id}>
                      <td>{record.studentName}</td>
                      <td>{record.classLevel || "-"}</td>
                      <td>{record.semester}</td>
                      <td>{record.academicYear}</td>
                      <td>{record.advisorSummary || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/screening?mode=edit&id=${record.id}`}>
                            แก้ไข
                          </Link>
                          <form action={deleteAction}>
                            <button type="submit">ลบ</button>
                          </form>
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
              <h2>เพิ่มแบบคัดกรองผู้เรียน</h2>
              <p>{selectedStudent.studentCode} - {selectedStudent.fullname}</p>
            </div>
          </div>
          <ScreeningForm
            action={createScreeningAction}
            student={selectedStudent}
            buttonLabel="บันทึกแบบคัดกรอง"
          />
        </div>
      ) : null}

      {mode === "edit" && selectedRecord ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>แก้ไขแบบคัดกรองผู้เรียน</h2>
              <p>{selectedRecord.studentName}</p>
            </div>
          </div>
          <ScreeningForm
            action={updateScreeningAction.bind(null, selectedRecord.id)}
            record={selectedRecord}
            buttonLabel="บันทึกการแก้ไข"
          />
        </div>
      ) : null}

      {mode === "add" && studentId && !selectedStudent ? (
        <p className="empty-state">ไม่พบผู้เรียนหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
      {mode === "edit" && recordId && !selectedRecord ? (
        <p className="empty-state">ไม่พบแบบคัดกรองหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
    </section>
  );
}

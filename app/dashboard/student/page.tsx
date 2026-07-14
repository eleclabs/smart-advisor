import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  createMajorAction,
  createStudentAction,
  deleteStudentAction,
  updateStudentAction
  , importStudentsAction
} from "@/actions/student.action";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import { MajorRepository } from "@/repositories/major.repository";
import StudentImport from "@/components/StudentImport";
import { StudentRepository } from "@/repositories/student.repository";

type StudentView = {
  id: string;
  studentCode: string;
  citizenId?: string;
  title?: string;
  fullname: string;
  classLevel: string;
  room: string;
  major: string;
  phone: string;
  gender: string;
  birthDate: string;
  age?: string;
  weight: string;
  height: string;
  bloodType: string;
  nickname?: string;
  nationality?: string;
  studentType?: string;
  disabilityType?: string;
  specialAbility?: string;
  chronicDisease?: string;
  religion: string;
  guardianName: string;
  address: string;
  note: string;
  profileImageUrl: string;
  profileImagePublicId: string;
  advisorEmail: string;
};

type StudentDocument = {
  _id: unknown;
  studentCode?: string;
  citizenId?: string;
  title?: string;
  fullname?: string;
  classLevel?: string;
  room?: string;
  major?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  age?: string;
  nickname?: string;
  weight?: string;
  height?: string;
  bloodType?: string;
  nationality?: string;
  studentType?: string;
  disabilityType?: string;
  specialAbility?: string;
  chronicDisease?: string;
  religion?: string;
  guardianName?: string;
  address?: string;
  note?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  advisorEmail?: string;
};

type MajorView = {
  id: string;
  name: string;
};

type MajorDocument = {
  _id: unknown;
  name?: string;
};

type StudentPageProps = {
  searchParams?: Promise<{
    mode?: string;
    id?: string;
  }>;
};

function toStudentView(student: StudentDocument): StudentView {
  return {
    id: String(student._id),
    studentCode: student.studentCode || "",
    citizenId: student.citizenId || "",
    title: student.title || "",
    fullname: student.fullname || "",
    classLevel: student.classLevel || "",
    room: student.room || "",
    major: student.major || "",
    phone: student.phone || "",
    gender: student.gender || "",
    birthDate: student.birthDate || "",
    age: student.age || "",
    weight: student.weight || "",
    height: student.height || "",
    bloodType: student.bloodType || "",
    nickname: student.nickname || "",
    nationality: student.nationality || "",
    studentType: student.studentType || "",
    disabilityType: student.disabilityType || "",
    specialAbility: student.specialAbility || "",
    chronicDisease: student.chronicDisease || "",
    religion: student.religion || "",
    guardianName: student.guardianName || "",
    address: student.address || "",
    note: student.note || "",
    profileImageUrl: student.profileImageUrl || "",
    profileImagePublicId: student.profileImagePublicId || "",
    advisorEmail: student.advisorEmail || ""
  };
}

function toMajorView(major: MajorDocument): MajorView {
  return {
    id: String(major._id),
    name: major.name || ""
  };
}

function StudentForm({
  action,
  buttonLabel,
  majors,
  student
}: {
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel: string;
  majors: MajorView[];
  student?: StudentView;
}) {
  return (
    <form className="management-form" action={action}>
      <div className="profile-editor">
        <StudentProfileImage name={student?.fullname || "ผู้เรียน"} url={student?.profileImageUrl || ""} />
        <label>
          รูปโปรไฟล์ผู้เรียน
          <input
            accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
            name="profileImage"
            type="file"
          />
          <small>รูปจะถูกย่อและบีบอัดเป็น WebP ก่อนจัดเก็บบน Cloudinary</small>
        </label>
        {student?.profileImageUrl ? (
          <label className="profile-remove-option">
            <input name="removeProfileImage" type="checkbox" value="true" />
            ลบรูปโปรไฟล์ปัจจุบัน
          </label>
        ) : null}
      </div>
      <div className="form-grid">
        <label>
          รหัสผู้เรียน
          <input name="studentCode" required defaultValue={student?.studentCode} />
        </label>

        <label>
          เลขประจำตัวประชาชน
          <input name="citizenId" defaultValue={student?.citizenId} />
        </label>

        <label>
          คำนำหน้าชื่อ
          <input name="title" defaultValue={student?.title} />
        </label>

        <label>
          ชื่อ-สกุล
          <input name="fullname" required defaultValue={student?.fullname} />
        </label>

        <label>
          ระดับชั้น
          <select name="classLevel" required defaultValue={student?.classLevel || ""}>
            <option value="" disabled>เลือกระดับชั้น</option>
            {CLASS_LEVEL_OPTIONS.map((classLevel) => (
              <option key={classLevel} value={classLevel}>
                {classLevel}
              </option>
            ))}
          </select>
        </label>

        <label>
          ห้อง
          <input name="room" defaultValue={student?.room} placeholder="เช่น 1, 2, 3" />
        </label>

        <label>
          สาขา
          <select name="major" required defaultValue={student?.major || ""}>
            <option value="" disabled>
              {majors.length > 0 ? "เลือกสาขา" : "กรุณาเพิ่มสาขาก่อน"}
            </option>
            {majors.map((major) => (
              <option key={major.id} value={major.name}>
                {major.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          เพศ
          <select
            name="gender"
            defaultValue={student?.gender === "หญิง" ? "หญิง" : "ชาย"}
            required
          >
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </label>

        <label>
          ชื่อเล่น
          <input name="nickname" defaultValue={student?.nickname} />
        </label>

        <label>
          วันเดือนปีเกิด
          <input type="date" name="birthDate" defaultValue={student?.birthDate} />
        </label>

        <label>
          อายุ
          <input name="age" defaultValue={student?.age} />
        </label>

        <label>
          น้ำหนัก
          <input name="weight" inputMode="decimal" defaultValue={student?.weight} />
        </label>

        <label>
          ส่วนสูง
          <input name="height" inputMode="decimal" defaultValue={student?.height} />
        </label>

        <label>
          หมู่เลือด
          <select name="bloodType" defaultValue={student?.bloodType || ""}>
            <option value="">ไม่ระบุ</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </label>

        <label>
          สัญชาติ
          <input name="nationality" defaultValue={student?.nationality} />
        </label>

        <label>
          ศาสนา
          <input name="religion" defaultValue={student?.religion} />
        </label>

        <label>
          เบอร์โทรศัพท์
          <input name="phone" defaultValue={student?.phone} />
        </label>

        <label>
          ผู้ปกครอง
          <input name="guardianName" defaultValue={student?.guardianName} />
        </label>

        <label>
          ประเภทนักเรียน
          <input name="studentType" defaultValue={student?.studentType} />
        </label>

        <label>
          ประเภทความพิการ
          <input name="disabilityType" defaultValue={student?.disabilityType} />
        </label>

        <label>
          ความสามารถพิเศษ
          <input name="specialAbility" defaultValue={student?.specialAbility} />
        </label>

        <label>
          โรคประจำตัว
          <input name="chronicDisease" defaultValue={student?.chronicDisease} />
        </label>
      </div>

      <label>
        ที่อยู่
        <textarea name="address" rows={3} defaultValue={student?.address} />
      </label>

      <label>
        หมายเหตุ
        <textarea name="note" rows={3} defaultValue={student?.note} />
      </label>

      <button className="management-primary-button" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}

function StudentProfileImage({ name, url }: { name: string; url: string }) {
  return url ? (
    <Image
      alt={`รูปโปรไฟล์ ${name}`}
      className="profile-image"
      height={160}
      src={url}
      width={160}
    />
  ) : (
    <div className="profile-image profile-image-placeholder">
      {name.trim().charAt(0) || "S"}
    </div>
  );
}

function StudentProfile({ student }: { student: StudentView }) {
  const physicalInfo = [
    student.weight ? `${student.weight} กก.` : "-",
    student.height ? `${student.height} ซม.` : "-"
  ].join(" / ");
  const classInfo = student.room
    ? `${student.classLevel} ห้อง ${student.room}`
    : student.classLevel;

  return (
    <div className="student-profile">
      <div className="student-profile-header">
        <StudentProfileImage name={student.fullname} url={student.profileImageUrl} />
        <div>
          <span>{student.studentCode}</span>
          <h2>{student.title ? `${student.title} ${student.fullname}` : student.fullname}</h2>
          <p>{classInfo} / {student.major}</p>
          <p>เลขประจำตัวประชาชน: {student.citizenId || '-'}</p>
          <p>ชื่อเล่น: {student.nickname || '-'}</p>
        </div>
      </div>

      <div className="student-profile-grid">
        <article>
          <span>ระดับชั้น</span>
          <strong>{student.classLevel || "-"}</strong>
        </article>

        <article>
          <span>ห้อง</span>
          <strong>{student.room || "-"}</strong>
        </article>

        <article>
          <span>สาขา</span>
          <strong>{student.major || "-"}</strong>
        </article>

        <article>
          <span>เพศ</span>
          <strong>{student.gender || "-"}</strong>
        </article>
        <article>
          <span>อายุ</span>
          <strong>{student.age || "-"}</strong>
        </article>
        <article>
          <span>วันเดือนปีเกิด</span>
          <strong>{student.birthDate || "-"}</strong>
        </article>

        <article>
          <span>น้ำหนัก / ส่วนสูง</span>
          <strong>{physicalInfo}</strong>
        </article>

        <article>
          <span>หมู่เลือด</span>
          <strong>{student.bloodType || "-"}</strong>
        </article>

        <article>
          <span>สัญชาติ</span>
          <strong>{student.nationality || "-"}</strong>
        </article>

        <article>
          <span>ประเภทนักเรียน</span>
          <strong>{student.studentType || "-"}</strong>
        </article>

        <article>
          <span>ประเภทความพิการ</span>
          <strong>{student.disabilityType || "-"}</strong>
        </article>

        <article>
          <span>ความสามารถพิเศษ</span>
          <strong>{student.specialAbility || "-"}</strong>
        </article>

        <article>
          <span>โรคประจำตัว</span>
          <strong>{student.chronicDisease || "-"}</strong>
        </article>

        <article>
          <span>ศาสนา</span>
          <strong>{student.religion || "-"}</strong>
        </article>

        <article>
          <span>เบอร์โทรศัพท์</span>
          <strong>{student.phone || "-"}</strong>
        </article>

        <article>
          <span>ผู้ปกครอง</span>
          <strong>{student.guardianName || "-"}</strong>
        </article>

        <article>
          <span>ที่อยู่</span>
          <strong>{student.address || "-"}</strong>
        </article>

        <article>
          <span>หมายเหตุ</span>
          <strong>{student.note || "-"}</strong>
        </article>
      </div>
    </div>
  );
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode;
  const selectedId = resolvedSearchParams?.id;
  const showStudentList = mode !== "add" && mode !== "view" && mode !== "edit";
  const roleLabel = session.user.role === "admin" ? "ผู้บริหาร" : "ครูที่ปรึกษา";
  const advisorEmail = String(session.user.email || "").trim().toLowerCase();
  const studentRecords = session.user.role === "admin"
    ? await StudentRepository.findAll()
    : await StudentRepository.findByAdvisor(advisorEmail);
  const majorRecords = session.user.role === "admin"
    ? await MajorRepository.findAll()
    : await MajorRepository.findByAdvisor(advisorEmail);
  const students = (studentRecords as StudentDocument[]).map(toStudentView);
  const majors = (majorRecords as MajorDocument[]).map(toMajorView);
  const selectedStudent = students.find((student) => student.id === selectedId);

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">{roleLabel}</p>
          <h1>การรู้จักผู้เรียนเป็นรายบุคคล</h1>
          <p className="dashboard-description">
            ดูรายชื่อผู้เรียนก่อน แล้วเลือกเพิ่ม ดู แก้ไข หรือลบข้อมูลผู้เรียน
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link
              className="management-primary-link"
              href={showStudentList ? "/dashboard/student?mode=add" : "/dashboard/student"}
            >
              {showStudentList ? "เพิ่มผู้เรียน" : "กลับไปรายชื่อ"}
            </Link>
          </div>

          <div style={{ width: "100%" }}>
            <StudentImport />
          </div>
        </div>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div>
            <h2>สาขา</h2>
            <p>เพิ่มสาขาเพื่อใช้เป็นตัวเลือกตอนกรอกข้อมูลผู้เรียน</p>
          </div>
        </div>

        <form className="major-form" action={createMajorAction}>
          <input name="name" required placeholder="เช่น เทคโนโลยีสารสนเทศ" />
          <button className="management-primary-button" type="submit">
            เพิ่มสาขา
          </button>
        </form>

        <div className="major-list">
          {majors.length === 0 ? (
            <span>ยังไม่มีสาขา</span>
          ) : (
            majors.map((major) => (
              <span key={major.id}>{major.name}</span>
            ))
          )}
        </div>
      </div>

      {showStudentList ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>รายชื่อผู้เรียน</h2>
              <p>{students.length} รายการ</p>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="empty-state">ยังไม่มีข้อมูลผู้เรียน</p>
          ) : (
            <div className="student-table-wrap">
              <table className="student-table">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-สกุล</th>
                  <th>ระดับชั้น</th>
                  <th>ห้อง</th>
                  <th>สาขา</th>
                  <th>เพศ</th>
                  <th>เบอร์โทรศัพท์</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const deleteAction = deleteStudentAction.bind(null, student.id);

                  return (
                    <tr key={student.id}>
                      <td>{student.studentCode}</td>
                      <td>
                        <Link
                          className="student-name-link"
                          href={`/dashboard/student?mode=view&id=${student.id}`}
                        >
                          <StudentProfileImage name={student.fullname} url={student.profileImageUrl} />
                          {student.fullname}
                        </Link>
                      </td>
                      <td>{student.classLevel}</td>
                      <td>{student.room || "-"}</td>
                      <td>{student.major}</td>
                      <td>{student.gender || "-"}</td>
                      <td>{student.phone || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/student?mode=view&id=${student.id}`}>
                            ดู
                          </Link>
                          <Link href={`/dashboard/student?mode=edit&id=${student.id}`}>
                            แก้ไข
                          </Link>
                          <form action={deleteAction}>
                            <button type="submit">
                              ลบ
                            </button>
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
      ) : null}

      {mode === "add" ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>เพิ่มข้อมูลผู้เรียน</h2>
              <p>กรอกข้อมูลพื้นฐานของผู้เรียน</p>
            </div>
            <Link href="/dashboard/student">กลับไปรายชื่อ</Link>
          </div>

          <StudentForm
            action={createStudentAction}
            buttonLabel="เพิ่มข้อมูลผู้เรียน"
            majors={majors}
          />
        </div>
      ) : null}

      {mode === "view" && selectedStudent ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>รายละเอียดผู้เรียน</h2>
            </div>
            <div className="user-detail-actions">
              <Link href="/dashboard/student">กลับไปรายชื่อ</Link>
              <Link href={`/dashboard/student?mode=edit&id=${selectedStudent.id}`}>
                แก้ไขข้อมูล
              </Link>
            </div>
          </div>

          <StudentProfile student={selectedStudent} />
        </div>
      ) : null}

      {mode === "edit" && selectedStudent ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>แก้ไขข้อมูลผู้เรียน</h2>
              <p>{selectedStudent.fullname}</p>
            </div>
            <Link href="/dashboard/student">กลับไปรายชื่อ</Link>
          </div>

          <StudentForm
            action={updateStudentAction.bind(null, selectedStudent.id)}
            buttonLabel="บันทึกการแก้ไข"
            majors={majors}
            student={selectedStudent}
          />
        </div>
      ) : null}

      {(mode === "view" || mode === "edit") && selectedId && !selectedStudent ? (
        <p className="empty-state">ไม่พบข้อมูลผู้เรียนที่เลือก</p>
      ) : null}
    </section>
  );
}

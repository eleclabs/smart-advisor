import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  createActivityAction,
  deleteActivityAction,
  updateActivityAction
} from "@/actions/activity.action";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import { MajorRepository } from "@/repositories/major.repository";
import { ActivityRepository } from "@/repositories/activity.repository";

type ActivityView = {
  id: string;
  classLevel: string;
  major: string;
  weekNumber: string;
  duration: string;
  topic: string;
  objectives: string;
  activitySteps: string;
  evaluation: string;
  activityResults: string;
  problems: string;
  followUpStudents: string;
  attachments: ActivityAttachmentView[];
  suggestions: string;
};

type ActivityAttachmentView = {
  fileId: string;
  name: string;
  contentType: string;
  size: number;
  publicId: string;
  url: string;
  resourceType: "image" | "raw";
  kind: "document" | "image";
};

type ActivityDocument = Partial<Omit<ActivityView, "id">> & {
  _id: unknown;
};

type MajorDocument = {
  name?: string;
};

type ActivityPageProps = {
  searchParams?: Promise<{
    mode?: string;
    id?: string;
  }>;
};

function toActivityView(activity: ActivityDocument): ActivityView {
  return {
    id: String(activity._id),
    classLevel: activity.classLevel || "",
    major: activity.major || "",
    weekNumber: activity.weekNumber || "",
    duration: activity.duration || "",
    topic: activity.topic || "",
    objectives: activity.objectives || "",
    activitySteps: activity.activitySteps || "",
    evaluation: activity.evaluation || "",
    activityResults: activity.activityResults || "",
    problems: activity.problems || "",
    followUpStudents: activity.followUpStudents || "",
    attachments: activity.attachments || [],
    suggestions: activity.suggestions || ""
  };
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </article>
  );
}

function ActivityDetail({ activity }: { activity: ActivityView }) {
  const documents = activity.attachments.filter((file) => file.kind === "document");
  const images = activity.attachments.filter((file) => file.kind === "image");

  return (
    <div className="activity-detail">
      <div className="student-profile-grid activity-detail-summary">
        <DetailItem label="ระดับชั้น" value={activity.classLevel} />
        <DetailItem label="สาขา" value={activity.major} />
        <DetailItem label="สัปดาห์ที่" value={activity.weekNumber} />
        <DetailItem label="ระยะเวลา" value={activity.duration} />
      </div>

      <div className="activity-detail-sections">
        <DetailItem label="หัวข้อเรื่อง" value={activity.topic} />
        <DetailItem label="วัตถุประสงค์" value={activity.objectives} />
        <DetailItem label="ขั้นตอนการดำเนินกิจกรรม" value={activity.activitySteps} />
        {/* การประเมินผลกิจกรรม ถูกตัดออกตามคำขอ */}
        <DetailItem label="ผลการจัดกิจกรรม" value={activity.activityResults} />
        <DetailItem label="ปัญหา/อุปสรรคที่พบ" value={activity.problems} />
        <DetailItem label="ผู้เรียนที่ต้องติดตามเป็นพิเศษ" value={activity.followUpStudents} />
        <DetailItem label="ข้อเสนอแนะ" value={activity.suggestions} />
      </div>

      <section className="activity-attachments">
        <h3>ไฟล์ประกอบกิจกรรม</h3>
        {documents.length === 0 ? (
          <p className="empty-state">ไม่มีไฟล์เอกสารประกอบกิจกรรม</p>
        ) : (
          <div className="activity-document-list">
            {documents.map((file) => (
              <a
                href={file.url || `/api/activities/${activity.id}/files/${file.fileId}`}
                key={file.fileId}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{file.name}</strong>
                <span>{formatFileSize(file.size)} · เปิดหรือดาวน์โหลด</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="activity-attachments">
        <h3>ภาพประกอบกิจกรรม</h3>
        {images.length === 0 ? (
          <p className="empty-state">ไม่มีภาพประกอบกิจกรรม</p>
        ) : (
          <div className="activity-image-grid">
            {images.map((file) => {
              const src = file.url || `/api/activities/${activity.id}/files/${file.fileId}`;
              return (
                <a href={src} key={file.fileId} target="_blank" rel="noreferrer">
                  <Image
                    alt={file.name}
                    height={360}
                    src={src}
                    unoptimized
                    width={640}
                  />
                  <span>{file.name}</span>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ActivityForm({
  action,
  activity,
  majors,
  buttonLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  activity?: ActivityView;
  majors: string[];
  buttonLabel: string;
}) {
  return (
    <form className="management-form activity-form" action={action}>
      <div className="activity-overview-grid">
        <label>
          ระดับชั้น
          <select name="classLevel" required defaultValue={activity?.classLevel || ""}>
            <option value="" disabled>เลือกระดับชั้น</option>
            {CLASS_LEVEL_OPTIONS.map((classLevel) => (
              <option key={classLevel} value={classLevel}>{classLevel}</option>
            ))}
          </select>
        </label>

        <label>
          สาขา
          <input
            name="major"
            list="activity-major-options"
            required
            placeholder="เลือกหรือกรอกสาขา"
            defaultValue={activity?.major}
          />
          <datalist id="activity-major-options">
            {majors.map((major) => <option key={major} value={major} />)}
          </datalist>
        </label>

        <label>
          สัปดาห์ที่
          <input
            name="weekNumber"
            type="number"
            min="1"
            required
            placeholder="เช่น 5"
            defaultValue={activity?.weekNumber}
          />
        </label>

        <label>
          ระยะเวลา
          <input
            name="duration"
            required
            placeholder="เช่น 2 ชั่วโมง"
            defaultValue={activity?.duration}
          />
        </label>
      </div>

      <fieldset className="screening-section">
        <legend>หัวข้อเรื่อง</legend>
        <input
          name="topic"
          required
          placeholder="ระบุหัวข้อกิจกรรม"
          defaultValue={activity?.topic}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>วัตถุประสงค์</legend>
        <textarea
          name="objectives"
          rows={4}
          placeholder="ระบุวัตถุประสงค์ของกิจกรรม"
          defaultValue={activity?.objectives}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>ขั้นตอนการดำเนินกิจกรรม</legend>
        <textarea
          name="activitySteps"
          rows={6}
          placeholder="อธิบายลำดับขั้นตอนการจัดกิจกรรม"
          defaultValue={activity?.activitySteps}
        />
      </fieldset>

      {/* การประเมินผลกิจกรรม ถูกตัดออกตามคำขอ */}

      <fieldset className="screening-section">
        <legend>บันทึกหลังกิจกรรม</legend>
        <div className="activity-notes-grid">
          <label>
            ผลการจัดกิจกรรม
            <textarea name="activityResults" rows={3} defaultValue={activity?.activityResults} />
          </label>
          <label>
            ปัญหา/อุปสรรคที่พบ
            <textarea name="problems" rows={3} defaultValue={activity?.problems} />
          </label>
          <label>
            ผู้เรียนที่ต้องติดตามเป็นพิเศษ
            <textarea name="followUpStudents" rows={3} defaultValue={activity?.followUpStudents} />
          </label>
          <label>
            แนบไฟล์ประกอบกิจกรรม
            <input
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              multiple
              name="documentFiles"
              type="file"
            />
            <small>รองรับ DOC, DOCX, PDF, XLS, XLSX ขนาดไม่เกิน 4 MB ต่อไฟล์</small>
          </label>
          <label>
            แนบภาพประกอบกิจกรรม
            <input
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              multiple
              name="imageFiles"
              type="file"
            />
            <small>รองรับ JPG, PNG, GIF, WEBP ขนาดไม่เกิน 4 MB ต่อภาพ</small>
          </label>
          {activity?.attachments.length ? (
            <div className="activity-existing-files activity-notes-wide">
              <strong>ไฟล์ที่แนบไว้</strong>
              {activity.attachments.map((file) => (
                <label key={file.fileId}>
                  <input
                    name="removeAttachmentIds"
                    type="checkbox"
                    value={file.fileId}
                  />
                  ลบ {file.name}
                </label>
              ))}
            </div>
          ) : null}
          <label className="activity-notes-wide">
            ข้อเสนอแนะ
            <textarea name="suggestions" rows={3} defaultValue={activity?.suggestions} />
          </label>
        </div>
      </fieldset>

      <div className="screening-form-actions">
        <button className="management-primary-button" type="submit">
          {buttonLabel}
        </button>
        <Link href="/dashboard/activity">ยกเลิก</Link>
      </div>
    </form>
  );
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const mode = params?.mode;
  const selectedId = params?.id;
  const advisorEmail = String(session.user.email || "").trim().toLowerCase();
  const isAdmin = session.user.role === "admin";
  const [activityDocuments, majorDocuments] = await Promise.all([
    isAdmin
      ? ActivityRepository.findAll()
      : ActivityRepository.findByAdvisor(advisorEmail),
    isAdmin
      ? MajorRepository.findAll()
      : MajorRepository.findByAdvisor(advisorEmail)
  ]);

  const activities = (activityDocuments as ActivityDocument[]).map(toActivityView);
  const majors = Array.from(new Set(
    (majorDocuments as MajorDocument[])
      .map((major) => major.name || "")
      .filter(Boolean)
  ));
  const selectedActivity = activities.find((activity) => activity.id === selectedId);

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">
            {isAdmin ? "ผู้บริหาร" : "ครูที่ปรึกษา"}
          </p>
          <h1>การส่งเสริมและพัฒนาผู้เรียน</h1>
          <p className="dashboard-description">
            วางแผน บันทึกผล และติดตามกิจกรรมส่งเสริมผู้เรียนรายสัปดาห์
          </p>
        </div>
        <Link className="management-primary-link" href="/dashboard/activity?mode=add">
          เพิ่มกิจกรรม
        </Link>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div>
            <h2>รายการกิจกรรม</h2>
            <p>{activities.length} รายการ</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <p className="empty-state">ยังไม่มีข้อมูลกิจกรรม</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table activity-table">
              <thead>
                <tr>
                  <th>สัปดาห์ที่</th>
                  <th>ระดับชั้น</th>
                  <th>สาขา</th>
                  <th>หัวข้อเรื่อง</th>
                  <th>ระยะเวลา</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const deleteAction = deleteActivityAction.bind(
                    null,
                    activity.id
                  );

                  return (
                    <tr key={activity.id}>
                      <td>{activity.weekNumber}</td>
                      <td>{activity.classLevel}</td>
                      <td>{activity.major}</td>
                      <td>{activity.topic}</td>
                      <td>{activity.duration}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/activity?mode=view&id=${activity.id}`}>
                            ดูรายละเอียด
                          </Link>
                          <Link href={`/dashboard/activity?mode=edit&id=${activity.id}`}>
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

      {mode === "add" ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>เพิ่มกิจกรรม</h2>
              <p>กรอกแผนและรายละเอียดการดำเนินกิจกรรม</p>
            </div>
          </div>
          <ActivityForm
            action={createActivityAction}
            majors={majors}
            buttonLabel="บันทึกกิจกรรม"
          />
        </div>
      ) : null}

      {mode === "view" && selectedActivity ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>รายละเอียดกิจกรรม</h2>
              <p>{selectedActivity.topic}</p>
            </div>
            <div className="table-actions">
              <Link href={`/dashboard/activity?mode=edit&id=${selectedActivity.id}`}>
                แก้ไข
              </Link>
              <Link href="/dashboard/activity">กลับไปรายการ</Link>
            </div>
          </div>
          <ActivityDetail activity={selectedActivity} />
        </div>
      ) : null}

      {mode === "edit" && selectedActivity ? (
        <div className="management-card">
          <div className="management-section-header">
            <div>
              <h2>แก้ไขกิจกรรม</h2>
              <p>{selectedActivity.topic}</p>
            </div>
          </div>
          <ActivityForm
            action={updateActivityAction.bind(null, selectedActivity.id)}
            activity={selectedActivity}
            majors={majors}
            buttonLabel="บันทึกการแก้ไข"
          />
        </div>
      ) : null}

      {(mode === "edit" || mode === "view") && selectedId && !selectedActivity ? (
        <p className="empty-state">ไม่พบกิจกรรมหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
    </section>
  );
}

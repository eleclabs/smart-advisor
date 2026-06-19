import Link from "next/link";
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
  supportingDocuments: string;
  suggestions: string;
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
    supportingDocuments: activity.supportingDocuments || "",
    suggestions: activity.suggestions || ""
  };
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
        <legend>1. หัวข้อเรื่อง</legend>
        <input
          name="topic"
          required
          placeholder="ระบุหัวข้อกิจกรรม"
          defaultValue={activity?.topic}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>2. วัตถุประสงค์</legend>
        <textarea
          name="objectives"
          rows={4}
          placeholder="ระบุวัตถุประสงค์ของกิจกรรม"
          defaultValue={activity?.objectives}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>3. ขั้นตอนการดำเนินกิจกรรม</legend>
        <textarea
          name="activitySteps"
          rows={6}
          placeholder="อธิบายลำดับขั้นตอนการจัดกิจกรรม"
          defaultValue={activity?.activitySteps}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>5. การประเมินผลกิจกรรม</legend>
        <textarea
          name="evaluation"
          rows={4}
          placeholder="ระบุวิธีและผลการประเมินกิจกรรม"
          defaultValue={activity?.evaluation}
        />
      </fieldset>

      <fieldset className="screening-section">
        <legend>6. บันทึกหลังกิจกรรม</legend>
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
            เอกสารประกอบกิจกรรม
            <textarea
              name="supportingDocuments"
              rows={3}
              placeholder="ชื่อไฟล์ ลิงก์ หรือรายละเอียดเอกสาร"
              defaultValue={activity?.supportingDocuments}
            />
          </label>
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
            {isAdmin ? "ผู้ดูแลระบบ" : "ครูที่ปรึกษา"}
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

      {mode === "edit" && selectedId && !selectedActivity ? (
        <p className="empty-state">ไม่พบกิจกรรมหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      ) : null}
    </section>
  );
}

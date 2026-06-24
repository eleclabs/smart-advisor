import Link from "next/link";
import { auth } from "@/lib/auth";
import { createSectionId, roleDashboards } from "@/lib/dashboard-menu";
import { isUserRole, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import { ActivityRepository } from "@/repositories/activity.repository";
import { InterventionRepository } from "@/repositories/intervention.repository";
import { ReferralRepository } from "@/repositories/referral.repository";
import { ScreeningRepository } from "@/repositories/screening.repository";
import { StudentRepository } from "@/repositories/student.repository";

type StudentSummary = {
  fullname?: string;
  studentCode?: string;
  classLevel?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type ScreeningSummary = {
  studentId?: unknown;
  studentName?: string;
  semester?: string;
  academicYear?: string;
  advisorSummary?: string;
  updatedAt?: Date | string;
};

type ActivitySummary = {
  topic?: string;
  classLevel?: string;
  major?: string;
  weekNumber?: string;
  updatedAt?: Date | string;
};

type InterventionSummary = {
  studentName?: string;
  problem?: string;
  resultStatus?: string;
  updatedAt?: Date | string;
};

type ReferralSummary = {
  studentName?: string;
  referralTypes?: string[];
  operationStatus?: string;
  updatedAt?: Date | string;
};

type ChartItem = {
  label: string;
  value: number;
  tone?: "blue" | "yellow" | "green" | "red";
};

type RecentItem = {
  type: string;
  title: string;
  detail: string;
  status: string;
  href: string;
  updatedAt?: Date | string;
};

function timestamp(value?: Date | string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value?: Date | string) {
  if (!value || timestamp(value) === 0) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function BarChart({ items, emptyText }: { items: ChartItem[]; emptyText: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  const hasData = items.some((item) => item.value > 0);

  if (!hasData) {
    return <p className="overview-empty">{emptyText}</p>;
  }

  return (
    <div className="overview-bars">
      {items.map((item) => (
        <div className="overview-bar-row" key={item.label}>
          <div className="overview-bar-label">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div
            aria-label={`${item.label} ${item.value} รายการ`}
            aria-valuemax={maximum}
            aria-valuemin={0}
            aria-valuenow={item.value}
            className="overview-bar-track"
            role="progressbar"
          >
            <span
              className={`overview-bar-fill overview-bar-${item.tone || "blue"}`}
              style={{ width: `${(item.value / maximum) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleDashboard({
  name,
  email,
  role
}: {
  name: string;
  email: string;
  role: UserRole;
}) {
  const dashboard = roleDashboards[role];

  return (
    <>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">{ROLE_LABELS[role]}</p>
          <h1>{dashboard.title}</h1>
          <p className="dashboard-description">{dashboard.description}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card"><span>ชื่อ</span><strong>{name}</strong></article>
        <article className="dashboard-card"><span>อีเมล</span><strong>{email}</strong></article>
        <article className="dashboard-card">
          <span>สิทธิ์การใช้งาน</span><strong>{ROLE_LABELS[role]}</strong>
        </article>
      </div>

      <div className="role-dashboard">
        <h2>{dashboard.menuTitle}</h2>
        <div className="role-dashboard-grid">
          {dashboard.items.map((item) => (
            <article
              className="dashboard-card"
              id={createSectionId(item.label)}
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

async function OperationalOverview({
  advisorEmail,
  isAdmin
}: {
  advisorEmail: string;
  isAdmin: boolean;
}) {
  const [
    studentDocuments,
    screeningDocuments,
    activityDocuments,
    interventionDocuments,
    referralDocuments
  ] =
    await Promise.all([
      isAdmin ? StudentRepository.findAll() : StudentRepository.findByAdvisor(advisorEmail),
      isAdmin ? ScreeningRepository.findAll() : ScreeningRepository.findByAdvisor(advisorEmail),
      isAdmin ? ActivityRepository.findAll() : ActivityRepository.findByAdvisor(advisorEmail),
      isAdmin
        ? InterventionRepository.findAll()
        : InterventionRepository.findByAdvisor(advisorEmail),
      isAdmin ? ReferralRepository.findAll() : ReferralRepository.findByAdvisor(advisorEmail)
    ]);

  const students = studentDocuments as StudentSummary[];
  const screenings = screeningDocuments as ScreeningSummary[];
  const activities = activityDocuments as ActivitySummary[];
  const interventions = interventionDocuments as InterventionSummary[];
  const referrals = referralDocuments as ReferralSummary[];

  const classCounts = new Map<string, number>();
  CLASS_LEVEL_OPTIONS.forEach((classLevel) => classCounts.set(classLevel, 0));
  students.forEach((student) => {
    const classLevel = student.classLevel || "ไม่ระบุระดับชั้น";
    classCounts.set(classLevel, (classCounts.get(classLevel) || 0) + 1);
  });
  const classChart = Array.from(classCounts, ([label, value]) => ({ label, value }));

  const normalScreenings = screenings.filter(
    (item) => item.advisorSummary === "กลุ่มปกติ"
  ).length;
  const riskScreenings = screenings.filter(
    (item) => item.advisorSummary === "กลุ่มเสี่ยง"
  ).length;
  const otherScreenings = screenings.length - normalScreenings - riskScreenings;
  const screeningChart: ChartItem[] = [
    { label: "กลุ่มปกติ", value: normalScreenings, tone: "green" },
    { label: "กลุ่มเสี่ยง", value: riskScreenings, tone: "red" },
    { label: "อื่นๆ / ยังไม่สรุป", value: otherScreenings, tone: "yellow" }
  ];

  const normalResults = interventions.filter((item) => item.resultStatus === "ปกติ").length;
  const referredResults = interventions.filter((item) => item.resultStatus === "ส่งต่อ").length;
  const pendingResults = interventions.length - normalResults - referredResults;
  const interventionChart: ChartItem[] = [
    { label: "ผลปกติ", value: normalResults, tone: "green" },
    { label: "ส่งต่อ", value: referredResults, tone: "red" },
    { label: "อยู่ระหว่างติดตาม", value: pendingResults, tone: "yellow" }
  ];

  const screenedStudentIds = new Set(
    screenings.map((item) => String(item.studentId || "")).filter(Boolean)
  );
  const screeningCoverage = students.length > 0
    ? Math.min(100, Math.round((screenedStudentIds.size / students.length) * 100))
    : 0;

  const recentItems: RecentItem[] = [
    ...students.map((student) => ({
      type: "ข้อมูลผู้เรียน",
      title: student.fullname || "ไม่ระบุชื่อ",
      detail: student.studentCode || "ไม่ระบุรหัส",
      status: student.classLevel || "ไม่ระบุระดับชั้น",
      href: "/dashboard/student",
      updatedAt: student.updatedAt || student.createdAt
    })),
    ...screenings.map((screening) => ({
      type: "การคัดกรอง",
      title: screening.studentName || "ไม่ระบุชื่อ",
      detail: `ภาคเรียน ${screening.semester || "-"} / ${screening.academicYear || "-"}`,
      status: screening.advisorSummary || "ยังไม่สรุป",
      href: "/dashboard/screening",
      updatedAt: screening.updatedAt
    })),
    ...activities.map((activity) => ({
      type: "กิจกรรมส่งเสริม",
      title: activity.topic || "ไม่ระบุหัวข้อ",
      detail: [activity.classLevel, activity.major].filter(Boolean).join(" / ") || "-",
      status: activity.weekNumber ? `สัปดาห์ที่ ${activity.weekNumber}` : "-",
      href: "/dashboard/activity",
      updatedAt: activity.updatedAt
    })),
    ...interventions.map((intervention) => ({
      type: "แผนช่วยเหลือ",
      title: intervention.studentName || "ไม่ระบุชื่อ",
      detail: intervention.problem || "ไม่ระบุปัญหา",
      status: intervention.resultStatus || "อยู่ระหว่างติดตาม",
      href: "/dashboard/intervention",
      updatedAt: intervention.updatedAt
    })),
    ...referrals.map((referral) => ({
      type: "การส่งต่อ",
      title: referral.studentName || "ไม่ระบุชื่อ",
      detail: referral.referralTypes?.join(", ") || "ไม่ระบุประเภท",
      status: referral.operationStatus || "อยู่ระหว่างการดำเนินการ",
      href: "/dashboard/referral",
      updatedAt: referral.updatedAt
    }))
  ].sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt)).slice(0, 10);

  const metrics = [
    { label: "ผู้เรียนทั้งหมด", value: students.length, href: "/dashboard/student", tone: "blue" },
    { label: "แบบคัดกรอง", value: screenings.length, href: "/dashboard/screening", tone: "yellow" },
    { label: "กิจกรรมส่งเสริม", value: activities.length, href: "/dashboard/activity", tone: "green" },
    { label: "แผนช่วยเหลือ", value: interventions.length, href: "/dashboard/intervention", tone: "red" },
    { label: "การส่งต่อ", value: referrals.length, href: "/dashboard/referral", tone: "blue" }
  ];

  return (
    <>
      <div className="dashboard-header overview-header">
        <div>
          <p className="dashboard-eyebrow">{isAdmin ? "ผู้บริหาร" : "ครูที่ปรึกษา"}</p>
          <h1>ภาพรวมระบบดูแลผู้เรียน</h1>
          <p className="dashboard-description">
            {isAdmin
              ? "สรุปข้อมูลผู้เรียนและการดำเนินงานทั้งหมดในระบบ"
              : "สรุปข้อมูลผู้เรียนและการดำเนินงานในความดูแลของคุณ"}
          </p>
        </div>
        <div className="overview-coverage">
          <span>ความครอบคลุมการคัดกรอง</span>
          <strong>{screeningCoverage}%</strong>
          <div className="overview-coverage-track">
            <span style={{ width: `${screeningCoverage}%` }} />
          </div>
        </div>
      </div>

      <div className="overview-metrics">
        {metrics.map((metric) => (
          <Link className={`overview-metric overview-metric-${metric.tone}`} href={metric.href} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>ดูรายละเอียด</small>
          </Link>
        ))}
      </div>

      <div className="overview-chart-grid">
        <article className="overview-panel overview-panel-wide">
          <div className="overview-panel-heading">
            <div><span>การกระจายตัว</span><h2>ผู้เรียนตามระดับชั้น</h2></div>
            <strong>{students.length} คน</strong>
          </div>
          <BarChart items={classChart} emptyText="ยังไม่มีข้อมูลผู้เรียน" />
        </article>

        <article className="overview-panel">
          <div className="overview-panel-heading">
            <div><span>ผลการคัดกรอง</span><h2>กลุ่มผู้เรียน</h2></div>
          </div>
          <BarChart items={screeningChart} emptyText="ยังไม่มีข้อมูลการคัดกรอง" />
        </article>

        <article className="overview-panel">
          <div className="overview-panel-heading">
            <div><span>การช่วยเหลือ</span><h2>ผลการติดตาม</h2></div>
          </div>
          <BarChart items={interventionChart} emptyText="ยังไม่มีข้อมูลแผนช่วยเหลือ" />
        </article>
      </div>

      <div className="overview-panel overview-recent">
        <div className="overview-panel-heading">
          <div><span>อัปเดตล่าสุด</span><h2>รายการดำเนินงานล่าสุด</h2></div>
          <strong>{recentItems.length} รายการ</strong>
        </div>
        {recentItems.length === 0 ? (
          <p className="overview-empty">ยังไม่มีข้อมูลการดำเนินงาน</p>
        ) : (
          <div className="student-table-wrap">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>ประเภท</th><th>รายการ</th><th>รายละเอียด</th>
                  <th>สถานะ</th><th>วันที่อัปเดต</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item, index) => (
                  <tr key={`${item.type}-${item.title}-${index}`}>
                    <td><span className="overview-type-badge">{item.type}</span></td>
                    <td><Link href={item.href}>{item.title}</Link></td>
                    <td>{item.detail}</td>
                    <td>{item.status}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name || "ผู้ใช้งาน";
  const email = session?.user?.email || "-";
  const sessionRole = session?.user?.role || "teacher";
  const role = isUserRole(sessionRole) ? sessionRole : "teacher";

  if (role !== "admin" && role !== "teacher") {
    return <RoleDashboard name={name} email={email} role={role} />;
  }

  return (
    <OperationalOverview
      advisorEmail={email.toLowerCase()}
      isAdmin={role === "admin"}
    />
  );
}

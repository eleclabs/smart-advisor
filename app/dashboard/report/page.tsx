import { redirect } from "next/navigation";
import PrintReportButton from "@/components/reports/PrintReportButton";
import { auth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { ActivityRepository } from "@/repositories/activity.repository";
import { InterventionRepository } from "@/repositories/intervention.repository";
import { ReferralRepository } from "@/repositories/referral.repository";
import { ScreeningRepository } from "@/repositories/screening.repository";
import { StudentRepository } from "@/repositories/student.repository";

type StudentRecord = {
  _id?: unknown;
  studentCode?: string;
  fullname?: string;
  classLevel?: string;
  major?: string;
};

type ScreeningRecord = {
  studentId?: unknown;
  advisorSummary?: string;
};

type ActivityRecord = {
  topic?: string;
};

type InterventionRecord = {
  studentId?: unknown;
  studentName?: string;
  studentCode?: string;
  classLevel?: string;
  problem?: string;
  changeLevel?: string;
  resultStatus?: string;
  resultSummary?: string;
  updatedAt?: Date | string;
};

type ReferralRecord = {
  studentId?: unknown;
  studentName?: string;
  classLevel?: string;
  major?: string;
  operationStatus?: string;
  assistanceResult?: string;
  followUps?: Array<{ number?: string; detail?: string }>;
  updatedAt?: Date | string;
};

type ChartItem = {
  label: string;
  value: number;
  tone?: "blue" | "green" | "yellow" | "red";
};

function countBy<T>(items: T[], getLabel: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const label = getLabel(item) || "ไม่ระบุ";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts, ([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "th"));
}

function VerticalBarChart({ items, emptyText }: { items: ChartItem[]; emptyText: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  if (!items.some((item) => item.value > 0)) {
    return <p className="overview-empty">{emptyText}</p>;
  }

  return (
    <div className="report-vertical-chart-wrap">
      <div
        className="report-vertical-chart"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(74px, 1fr))` }}
      >
        {items.map((item) => (
          <div className="report-vertical-item" key={item.label}>
            <strong>{item.value}</strong>
            <div
              aria-label={`${item.label} ${item.value} รายการ`}
              aria-valuemax={maximum}
              aria-valuemin={0}
              aria-valuenow={item.value}
              className="report-vertical-track"
              role="progressbar"
            >
              <span
                className={`report-vertical-fill overview-bar-${item.tone || "blue"}`}
                style={{ height: `${Math.max((item.value / maximum) * 100, 4)}%` }}
              />
            </div>
            <span
              className="report-vertical-label"
              title={item.label}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ items, emptyText }: { items: ChartItem[]; emptyText: string }) {
  const activeItems = items.filter((item) => item.value > 0);
  const total = activeItems.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <p className="overview-empty">{emptyText}</p>;

  const colors = ["#0f4cbd", "#16a34a", "#f4b400", "#dc2626", "#7c3aed", "#0891b2"];
  const segments = activeItems.reduce<string[]>((result, item, index) => {
    const start = activeItems
      .slice(0, index)
      .reduce((sum, previous) => sum + (previous.value / total) * 100, 0);
    const end = start + (item.value / total) * 100;
    return [...result, `${colors[index % colors.length]} ${start}% ${end}%`];
  }, []);

  return (
    <div className="report-donut-layout">
      <div
        aria-label={`รวม ${total} รายการ`}
        className="report-donut"
        role="img"
        style={{ background: `conic-gradient(${segments.join(", ")})` }}
      >
        <div><strong>{total}</strong><span>รวมทั้งหมด</span></div>
      </div>
      <div className="report-donut-legend">
        {activeItems.map((item, index) => (
          <div key={item.label}>
            <span style={{ background: colors[index % colors.length] }} />
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <small>{Math.round((item.value / total) * 100)}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function latestTimestamp(value?: Date | string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "teacher" && role !== "committee" && role !== "admin") {
    redirect("/dashboard");
  }

  const advisorEmail = String(session.user.email || "").trim().toLowerCase();
  const viewAll = role === "admin" || role === "committee";
  const [
    studentDocuments,
    screeningDocuments,
    activityDocuments,
    interventionDocuments,
    referralDocuments
  ] = await Promise.all([
    viewAll ? StudentRepository.findAll() : StudentRepository.findByAdvisor(advisorEmail),
    viewAll ? ScreeningRepository.findAll() : ScreeningRepository.findByAdvisor(advisorEmail),
    viewAll ? ActivityRepository.findAll() : ActivityRepository.findByAdvisor(advisorEmail),
    viewAll ? InterventionRepository.findAll() : InterventionRepository.findByAdvisor(advisorEmail),
    viewAll ? ReferralRepository.findAll() : ReferralRepository.findByAdvisor(advisorEmail)
  ]);

  const students = studentDocuments as StudentRecord[];
  const screenings = screeningDocuments as ScreeningRecord[];
  const activities = activityDocuments as ActivityRecord[];
  const interventions = interventionDocuments as InterventionRecord[];
  const referrals = referralDocuments as ReferralRecord[];

  const classSummary = countBy(students, (student) => student.classLevel || "ไม่ระบุชั้นปี");
  const majorSummary = countBy(students, (student) => student.major || "ไม่ระบุสาขาวิชา");
  const classMajorMap = new Map<string, number>();
  students.forEach((student) => {
    const classLevel = student.classLevel || "ไม่ระบุชั้นปี";
    const major = student.major || "ไม่ระบุสาขาวิชา";
    const key = `${classLevel}\u0000${major}`;
    classMajorMap.set(key, (classMajorMap.get(key) || 0) + 1);
  });
  const classMajorRows = Array.from(classMajorMap, ([key, count]) => {
    const [classLevel, major] = key.split("\u0000");
    return { classLevel, major, count };
  }).sort((left, right) =>
    left.classLevel.localeCompare(right.classLevel, "th") ||
    left.major.localeCompare(right.major, "th")
  );

  const domainRows = [
    {
      label: "การรู้จักผู้เรียนเป็นรายบุคคล",
      count: students.length,
      description: "ข้อมูลประวัติและข้อมูลพื้นฐานผู้เรียน"
    },
    {
      label: "การคัดกรองผู้เรียน",
      count: screenings.length,
      description: "แบบคัดกรองและผลสรุปกลุ่มผู้เรียน"
    },
    {
      label: "การส่งเสริมและพัฒนาผู้เรียน",
      count: activities.length,
      description: "กิจกรรมส่งเสริมและพัฒนาผู้เรียน"
    },
    {
      label: "การป้องกันและแก้ไขปัญหาผู้เรียน",
      count: interventions.length,
      description: "แผนช่วยเหลือและผลการดำเนินงาน"
    },
    {
      label: "การส่งต่อผู้เรียน",
      count: referrals.length,
      description: "ข้อมูลการส่งต่อและการติดตามผล"
    }
  ];

  const domainChart: ChartItem[] = domainRows.map((item, index) => ({
    label: item.label,
    value: item.count,
    tone: (["blue", "yellow", "green", "red", "blue"] as const)[index]
  }));

  const screeningStatuses = countBy(screenings, (item) => item.advisorSummary || "ยังไม่สรุป");
  const interventionStatuses = countBy(
    interventions,
    (item) => item.resultStatus || "อยู่ระหว่างติดตาม"
  );
  const referralStatuses = countBy(
    referrals,
    (item) => item.operationStatus || "ยังไม่ระบุสถานะ"
  );
  const totalFollowUps = referrals.reduce(
    (sum, referral) => sum + (referral.followUps?.length || 0),
    0
  );

  const studentLookup = new Map(
    students.map((student) => [String(student._id || ""), student])
  );
  const followUpRows = [
    ...interventions.map((item) => {
      const student = studentLookup.get(String(item.studentId || ""));
      return {
        key: `intervention-${String(item.studentId || "")}-${String(item.updatedAt || "")}`,
        studentCode: item.studentCode || student?.studentCode || "-",
        studentName: item.studentName || student?.fullname || "-",
        classLevel: item.classLevel || student?.classLevel || "-",
        major: student?.major || "-",
        process: "การป้องกันและแก้ไขปัญหา",
        status: item.resultStatus || item.changeLevel || "อยู่ระหว่างติดตาม",
        result: item.resultSummary || item.problem || "-",
        followUps: "-",
        updatedAt: item.updatedAt
      };
    }),
    ...referrals.map((item) => {
      const student = studentLookup.get(String(item.studentId || ""));
      return {
        key: `referral-${String(item.studentId || "")}-${String(item.updatedAt || "")}`,
        studentCode: student?.studentCode || "-",
        studentName: item.studentName || student?.fullname || "-",
        classLevel: item.classLevel || student?.classLevel || "-",
        major: item.major || student?.major || "-",
        process: "การส่งต่อผู้เรียน",
        status: item.operationStatus || "ยังไม่ระบุสถานะ",
        result: item.assistanceResult || "-",
        followUps: `${item.followUps?.length || 0} ครั้ง`,
        updatedAt: item.updatedAt
      };
    })
  ].sort((left, right) => latestTimestamp(right.updatedAt) - latestTimestamp(left.updatedAt));

  return (
    <section className="report-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">{ROLE_LABELS[role]}</p>
          <h1>การรายงานผล</h1>
          <p className="dashboard-description">
            {viewAll
              ? "สรุปข้อมูลผู้เรียนและผลการดำเนินงานภาพรวมทั้งระบบ"
              : "สรุปข้อมูลผู้เรียนและผลการดำเนินงานในความดูแลของคุณ"}
          </p>
        </div>
      </div>

      <div className="report-metrics">
        <article><span>ผู้เรียนทั้งหมด</span><strong>{students.length}</strong><small>คน</small></article>
        <article><span>ข้อมูลคัดกรอง</span><strong>{screenings.length}</strong><small>รายการ</small></article>
        <article><span>แผนช่วยเหลือ</span><strong>{interventions.length}</strong><small>รายการ</small></article>
        <article><span>การติดตามหลังส่งต่อ</span><strong>{totalFollowUps}</strong><small>ครั้ง</small></article>
      </div>

      <section className="report-section" data-report-section="student-summary">
        <div className="report-section-heading">
          <div><span>ส่วนที่ 1</span><h2>ข้อมูลสรุปผู้เรียน แยกตามชั้นปีและสาขาวิชา</h2></div>
          <PrintReportButton
            section="student-summary"
            title="รายงานสรุปผู้เรียนตามชั้นปีและสาขาวิชา"
          />
        </div>
        <div className="report-chart-grid">
          <article className="overview-panel">
            <div className="overview-panel-heading"><div><span>ชั้นปี</span><h2>จำนวนผู้เรียนตามชั้นปี</h2></div></div>
            <VerticalBarChart items={classSummary} emptyText="ยังไม่มีข้อมูลผู้เรียน" />
          </article>
          <article className="overview-panel">
            <div className="overview-panel-heading"><div><span>สาขาวิชา</span><h2>จำนวนผู้เรียนตามสาขาวิชา</h2></div></div>
            <DonutChart items={majorSummary} emptyText="ยังไม่มีข้อมูลผู้เรียน" />
          </article>
        </div>
        <div className="student-table-wrap report-table-wrap">
          <table className="overview-table report-table">
            <thead><tr><th>ชั้นปี</th><th>สาขาวิชา</th><th>จำนวนผู้เรียน</th><th>สัดส่วน</th></tr></thead>
            <tbody>
              {classMajorRows.length ? classMajorRows.map((row) => (
                <tr key={`${row.classLevel}-${row.major}`}>
                  <td>{row.classLevel}</td>
                  <td>{row.major}</td>
                  <td>{row.count}</td>
                  <td>{students.length ? `${Math.round((row.count / students.length) * 100)}%` : "0%"}</td>
                </tr>
              )) : <tr><td colSpan={4}>ยังไม่มีข้อมูลผู้เรียน</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-section" data-report-section="system-domains">
        <div className="report-section-heading">
          <div><span>ส่วนที่ 2</span><h2>ข้อมูลที่มีอยู่ในระบบแต่ละด้าน</h2></div>
          <PrintReportButton
            section="system-domains"
            title="รายงานสรุปข้อมูลในระบบแต่ละด้าน"
          />
        </div>
        <article className="overview-panel">
          <VerticalBarChart items={domainChart} emptyText="ยังไม่มีข้อมูลการดำเนินงาน" />
        </article>
        <div className="student-table-wrap report-table-wrap">
          <table className="overview-table report-table">
            <thead><tr><th>ด้านการดำเนินงาน</th><th>รายละเอียด</th><th>จำนวนข้อมูล</th></tr></thead>
            <tbody>
              {domainRows.map((row) => (
                <tr key={row.label}><td>{row.label}</td><td>{row.description}</td><td>{row.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-section" data-report-section="follow-up-results">
        <div className="report-section-heading">
          <div><span>ส่วนที่ 3</span><h2>ผลการติดตามการช่วยเหลือผู้เรียน</h2></div>
          <PrintReportButton
            section="follow-up-results"
            title="รายงานผลการติดตามการช่วยเหลือผู้เรียน"
          />
        </div>
        <div className="report-chart-grid report-chart-grid-three">
          <article className="overview-panel">
            <div className="overview-panel-heading"><div><span>คัดกรอง</span><h2>ผลสรุปกลุ่มผู้เรียน</h2></div></div>
            <DonutChart items={screeningStatuses} emptyText="ยังไม่มีผลการคัดกรอง" />
          </article>
          <article className="overview-panel">
            <div className="overview-panel-heading"><div><span>ช่วยเหลือ</span><h2>ผลการป้องกันและแก้ไขปัญหา</h2></div></div>
            <DonutChart items={interventionStatuses} emptyText="ยังไม่มีผลการช่วยเหลือ" />
          </article>
          <article className="overview-panel">
            <div className="overview-panel-heading"><div><span>ส่งต่อ</span><h2>สถานะการส่งต่อผู้เรียน</h2></div></div>
            <DonutChart items={referralStatuses} emptyText="ยังไม่มีผลการส่งต่อ" />
          </article>
        </div>
        <div className="student-table-wrap report-table-wrap">
          <table className="overview-table report-table report-follow-up-table">
            <thead>
              <tr>
                <th>รหัส</th><th>ชื่อผู้เรียน</th><th>ชั้นปี</th><th>สาขาวิชา</th>
                <th>กระบวนการ</th><th>สถานะ/ผล</th><th>รายละเอียดผล</th><th>ติดตาม</th>
              </tr>
            </thead>
            <tbody>
              {followUpRows.length ? followUpRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.studentCode}</td><td>{row.studentName}</td><td>{row.classLevel}</td>
                  <td>{row.major}</td><td>{row.process}</td><td>{row.status}</td>
                  <td>{row.result}</td><td>{row.followUps}</td>
                </tr>
              )) : <tr><td colSpan={8}>ยังไม่มีข้อมูลผลการติดตามการช่วยเหลือผู้เรียน</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

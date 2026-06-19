import { auth } from "@/lib/auth";
import { createSectionId, roleDashboards } from "@/lib/dashboard-menu";
import { isUserRole, ROLE_LABELS } from "@/lib/roles";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name || "ผู้ใช้งาน";
  const email = session?.user?.email || "-";
  const sessionRole = session?.user?.role || "student";
  const role = isUserRole(sessionRole) ? sessionRole : "student";
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
        <article className="dashboard-card">
          <span>ชื่อ</span>
          <strong>{name}</strong>
        </article>

        <article className="dashboard-card">
          <span>อีเมล</span>
          <strong>{email}</strong>
        </article>

        <article className="dashboard-card">
          <span>สิทธิ์การใช้งาน</span>
          <strong>{ROLE_LABELS[role]}</strong>
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

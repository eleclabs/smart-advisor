import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import { auth } from "@/lib/auth";
import { createSectionId, roleDashboards } from "@/lib/dashboard-menu";
import { isUserRole, ROLE_LABELS } from "@/lib/roles";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name || "ผู้ใช้งาน";
  const email = session.user.email || "-";
  const sessionRole = session.user.role || "teacher";
  const role = isUserRole(sessionRole) ? sessionRole : "teacher";
  const dashboard = roleDashboards[role];

  return (
    <section className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-header">
            <p className="dashboard-eyebrow">{ROLE_LABELS[role]}</p>
            <h2>{dashboard.menuTitle}</h2>
          </div>

          <nav aria-label="เมนูหน้าหลัก">
            <ul className="dashboard-menu">
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>

              {dashboard.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href || `/dashboard#${createSectionId(item.label)}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="dashboard-user-panel">
            <span>เข้าสู่ระบบในชื่อ</span>
            <strong>{name}</strong>
            <small>{email}</small>
          </div>

          <form action={logoutAction}>
            <button className="dashboard-logout" type="submit">
              ออกจากระบบ
            </button>
          </form>
        </aside>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </section>
  );
}

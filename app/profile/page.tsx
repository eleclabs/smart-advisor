import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUserRole, ROLE_LABELS } from "@/lib/roles";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sessionRole = session.user.role || "student";
  const roleLabel = isUserRole(sessionRole)
    ? ROLE_LABELS[sessionRole]
    : "ผู้ใช้งาน";

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ข้อมูลส่วนตัว</p>
          <h1>{session.user.name || "ผู้ใช้งาน"}</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>ชื่อ</span>
          <strong>{session.user.name || "-"}</strong>
        </article>

        <article className="dashboard-card">
          <span>อีเมล</span>
          <strong>{session.user.email || "-"}</strong>
        </article>

        <article className="dashboard-card">
          <span>สิทธิ์การใช้งาน</span>
          <strong>{roleLabel}</strong>
        </article>
      </div>
    </section>
  );
}

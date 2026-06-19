import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteUserAction, updateUserAction } from "@/actions/user.action";
import { auth } from "@/lib/auth";
import { isUserRole, ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";

type UserView = {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: Date | string;
};

type UserDocument = {
  _id: unknown;
  fullname?: string;
  email?: string;
  role?: string;
  active?: boolean;
  createdAt?: Date | string;
};

type UsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    mode?: string;
    id?: string;
  }>;
};

function toUserView(user: UserDocument): UserView {
  const role = String(user.role || "student");

  return {
    id: String(user._id),
    fullname: user.fullname || "",
    email: user.email || "",
    role: isUserRole(role) ? role : "student",
    active: user.active !== false,
    createdAt: user.createdAt
  };
}

function formatDate(value?: Date | string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function UserProfile({ user, isCurrentUser }: { user: UserView; isCurrentUser: boolean }) {
  return (
    <div className="student-profile-grid user-profile-grid">
      <article><span>ชื่อ-นามสกุล</span><strong>{user.fullname || "-"}</strong></article>
      <article><span>อีเมล</span><strong>{user.email || "-"}</strong></article>
      <article><span>สิทธิ์การใช้งาน</span><strong>{ROLE_LABELS[user.role]}</strong></article>
      <article><span>สถานะบัญชี</span><strong>{user.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</strong></article>
      <article><span>วันที่สมัคร</span><strong>{formatDate(user.createdAt)}</strong></article>
      <article><span>ประเภทบัญชี</span><strong>{isCurrentUser ? "บัญชีของคุณ" : "ผู้ใช้งานระบบ"}</strong></article>
    </div>
  );
}

function UserForm({
  user,
  isCurrentUser
}: {
  user: UserView;
  isCurrentUser: boolean;
}) {
  return (
    <form className="management-form" action={updateUserAction.bind(null, user.id)}>
      <div className="form-grid">
        <label>
          ชื่อ-นามสกุล
          <input name="fullname" required defaultValue={user.fullname} />
        </label>
        <label>
          อีเมล
          <input name="email" type="email" required defaultValue={user.email} />
        </label>

        {isCurrentUser ? (
          <>
            <input type="hidden" name="role" value={user.role} />
            <label>
              สิทธิ์การใช้งาน
              <select disabled defaultValue={user.role}>
                <option value={user.role}>{ROLE_LABELS[user.role]}</option>
              </select>
            </label>
            <input type="hidden" name="active" value="true" />
            <label>
              สถานะบัญชี
              <select disabled defaultValue="true">
                <option value="true">เปิดใช้งาน</option>
              </select>
            </label>
          </>
        ) : (
          <>
            <label>
              สิทธิ์การใช้งาน
              <select name="role" required defaultValue={user.role}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </label>
            <label>
              สถานะบัญชี
              <select name="active" required defaultValue={String(user.active)}>
                <option value="true">เปิดใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
              </select>
            </label>
          </>
        )}
      </div>

      {isCurrentUser ? (
        <p className="user-safety-note">
          เพื่อป้องกันการสูญเสียสิทธิ์ คุณไม่สามารถลด role หรือปิดบัญชีที่กำลังใช้งานได้
        </p>
      ) : null}

      <div className="screening-form-actions">
        <button className="management-primary-button" type="submit">บันทึกการแก้ไข</button>
        <Link href="/dashboard/users">ยกเลิก</Link>
      </div>
    </form>
  );
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const query = String(params?.q || "").trim();
  const mode = params?.mode;
  const selectedId = params?.id;
  const userDocuments = query
    ? await UserRepository.search(query)
    : await UserRepository.findAll();
  const users = (userDocuments as UserDocument[]).map(toUserView);
  let selectedUser = users.find((user) => user.id === selectedId);
  if (!selectedUser && selectedId) {
    const selectedDocument = await UserRepository.findById(selectedId);
    selectedUser = selectedDocument
      ? toUserView(selectedDocument as UserDocument)
      : undefined;
  }
  const currentUserId = String(session.user.id || "");
  const activeCount = users.filter((user) => user.active).length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">ผู้ดูแลระบบ</p>
          <h1>จัดการข้อมูลผู้ใช้งาน</h1>
          <p className="dashboard-description">
            ดู แก้ไขสถานะ เปลี่ยนสิทธิ์การใช้งาน หรือลบบัญชีผู้ใช้ในระบบ
          </p>
        </div>
      </div>

      <div className="user-summary-grid">
        <article><span>ผู้ใช้ทั้งหมด</span><strong>{users.length}</strong></article>
        <article><span>บัญชีที่ใช้งาน</span><strong>{activeCount}</strong></article>
        <article><span>ผู้ดูแลระบบ</span><strong>{adminCount}</strong></article>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div><h2>ค้นหาผู้ใช้งาน</h2><p>ค้นหาด้วยชื่อหรืออีเมล</p></div>
        </div>
        <form className="screening-search" method="get">
          <input name="q" defaultValue={query} placeholder="กรอกชื่อหรืออีเมล" />
          <button className="management-primary-button" type="submit">ค้นหา</button>
          {query ? <Link href="/dashboard/users">ล้างการค้นหา</Link> : null}
        </form>
      </div>

      <div className="management-card">
        <div className="management-section-header">
          <div><h2>รายชื่อผู้ใช้งาน</h2><p>{users.length} รายการ</p></div>
        </div>
        {users.length === 0 ? (
          <p className="empty-state">ไม่พบข้อมูลผู้ใช้งาน</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table user-table">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th><th>อีเมล</th><th>สิทธิ์การใช้งาน</th>
                  <th>สถานะ</th><th>วันที่สมัคร</th><th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const deleteAction = deleteUserAction.bind(null, user.id);

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-name-cell">
                          <strong>{user.fullname || "-"}</strong>
                          {isCurrentUser ? <small>บัญชีของคุณ</small> : null}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td><span className="user-role-badge">{ROLE_LABELS[user.role]}</span></td>
                      <td>
                        <span className={`user-status user-status-${user.active ? "active" : "inactive"}`}>
                          {user.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/users?mode=view&id=${user.id}`}>ดู</Link>
                          <Link href={`/dashboard/users?mode=edit&id=${user.id}`}>แก้ไข</Link>
                          {isCurrentUser ? (
                            <button disabled type="button">ลบ</button>
                          ) : (
                            <form action={deleteAction}><button type="submit">ลบ</button></form>
                          )}
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

      {mode === "view" && selectedUser ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>รายละเอียดผู้ใช้งาน</h2><p>{selectedUser.email}</p></div>
            <Link href={`/dashboard/users?mode=edit&id=${selectedUser.id}`}>แก้ไขข้อมูล</Link>
          </div>
          <UserProfile user={selectedUser} isCurrentUser={selectedUser.id === currentUserId} />
        </div>
      ) : null}

      {mode === "edit" && selectedUser ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>แก้ไขข้อมูลผู้ใช้งาน</h2><p>{selectedUser.fullname}</p></div>
          </div>
          <UserForm user={selectedUser} isCurrentUser={selectedUser.id === currentUserId} />
        </div>
      ) : null}

      {(mode === "view" || mode === "edit") && selectedId && !selectedUser ? (
        <p className="empty-state">ไม่พบผู้ใช้งานที่เลือก</p>
      ) : null}
    </section>
  );
}

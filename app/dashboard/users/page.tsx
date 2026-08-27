import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { deleteUserAction, updateUserAction } from "@/actions/user.action";
import { auth } from "@/lib/auth";
import { maskCitizenId } from "@/lib/format";
import { isUserRole, ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";

type UserView = {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  active: boolean;
  profileImageUrl: string;
  profileImagePublicId: string;
  gender: string;
  title: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  citizenId: string;
  region: string;
  province: string;
  vocationalOffice: string;
  educationType: string;
  schoolProvince: string;
  schoolName: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type UserDocument = {
  _id: unknown;
  fullname?: string;
  email?: string;
  role?: string;
  roles?: string[];
  active?: boolean;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  gender?: string;
  title?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  phone?: string;
  citizenId?: string;
  region?: string;
  province?: string;
  vocationalOffice?: string;
  educationType?: string;
  schoolProvince?: string;
  schoolName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const GENDER_LABELS: Record<string, string> = {
  male: "ชาย",
  female: "หญิง"
};

type UsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    mode?: string;
    id?: string;
  }>;
};

function toUserView(user: UserDocument): UserView {
  const role = String(user.role || "teacher");
  const roles = (user.roles || []).filter(isUserRole);
  const effectiveRoles = roles.length
    ? roles
    : [isUserRole(role) ? role : "teacher"];

  return {
    id: String(user._id),
    fullname: user.fullname || "",
    email: user.email || "",
    role: effectiveRoles[0],
    roles: effectiveRoles,
    active: user.active !== false,
    profileImageUrl: user.profileImageUrl || "",
    profileImagePublicId: user.profileImagePublicId || "",
    gender: user.gender || "",
    title: user.title || "",
    firstNameTh: user.firstNameTh || "",
    lastNameTh: user.lastNameTh || "",
    firstNameEn: user.firstNameEn || "",
    lastNameEn: user.lastNameEn || "",
    phone: user.phone || "",
    citizenId: user.citizenId || "",
    region: user.region || "",
    province: user.province || "",
    vocationalOffice: user.vocationalOffice || "",
    educationType: user.educationType || "",
    schoolProvince: user.schoolProvince || "",
    schoolName: user.schoolName || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
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
    <div className="user-profile-detail">
      <ProfileImage name={user.fullname} url={user.profileImageUrl} />

      <h3 className="user-profile-section-title">ข้อมูลบัญชี</h3>
      <div className="student-profile-grid user-profile-grid">
        <article><span>ชื่อ-นามสกุล</span><strong>{user.fullname || "-"}</strong></article>
        <article><span>อีเมล</span><strong>{user.email || "-"}</strong></article>
        <article>
          <span>สิทธิ์การใช้งาน</span>
          <strong>{user.roles.map((role) => ROLE_LABELS[role]).join(", ")}</strong>
        </article>
        <article><span>สถานะบัญชี</span><strong>{user.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</strong></article>
        <article><span>วันที่สมัคร</span><strong>{formatDate(user.createdAt)}</strong></article>
        <article><span>แก้ไขล่าสุด</span><strong>{formatDate(user.updatedAt)}</strong></article>
        <article><span>ประเภทบัญชี</span><strong>{isCurrentUser ? "บัญชีของคุณ" : "ผู้ใช้งานระบบ"}</strong></article>
      </div>

      <h3 className="user-profile-section-title">ข้อมูลส่วนตัว</h3>
      <div className="student-profile-grid user-profile-grid">
        <article><span>คำนำหน้า</span><strong>{user.title || "-"}</strong></article>
        <article><span>เพศ</span><strong>{GENDER_LABELS[user.gender] || user.gender || "-"}</strong></article>
        <article><span>ชื่อ-นามสกุล (ไทย)</span><strong>{[user.firstNameTh, user.lastNameTh].filter(Boolean).join(" ") || "-"}</strong></article>
        <article><span>ชื่อ-นามสกุล (อังกฤษ)</span><strong>{[user.firstNameEn, user.lastNameEn].filter(Boolean).join(" ") || "-"}</strong></article>
        <article><span>เบอร์โทรศัพท์</span><strong>{user.phone || "-"}</strong></article>
        <article><span>เลขบัตรประชาชน</span><strong>{maskCitizenId(user.citizenId)}</strong></article>
      </div>

      <h3 className="user-profile-section-title">ข้อมูลสถานศึกษา</h3>
      <div className="student-profile-grid user-profile-grid">
        <article><span>ภาค</span><strong>{user.region || "-"}</strong></article>
        <article><span>จังหวัด</span><strong>{user.province || "-"}</strong></article>
        <article><span>สำนักงานอาชีวศึกษา</span><strong>{user.vocationalOffice || "-"}</strong></article>
        <article><span>ประเภทการศึกษา</span><strong>{user.educationType || "-"}</strong></article>
        <article><span>จังหวัดสถานศึกษา</span><strong>{user.schoolProvince || "-"}</strong></article>
        <article><span>สถานศึกษา</span><strong>{user.schoolName || "-"}</strong></article>
      </div>
    </div>
  );
}

function ProfileImage({ name, url }: { name: string; url: string }) {
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
      {name.trim().charAt(0) || "U"}
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
      <div className="profile-editor">
        <ProfileImage name={user.fullname} url={user.profileImageUrl} />
        <label>
          รูปโปรไฟล์ผู้ใช้งาน
          <input
            accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
            name="profileImage"
            type="file"
          />
          <small>รูปจะถูกย่อและบีบอัดเป็น WebP ก่อนจัดเก็บบน Cloudinary</small>
        </label>
        {user.profileImageUrl ? (
          <label className="profile-remove-option">
            <input name="removeProfileImage" type="checkbox" value="true" />
            ลบรูปโปรไฟล์ปัจจุบัน
          </label>
        ) : null}
      </div>
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
            {user.roles.map((role) => (
              <input key={role} type="hidden" name="roles" value={role} />
            ))}
            <label>
              สิทธิ์การใช้งาน
              <input
                disabled
                value={user.roles.map((role) => ROLE_LABELS[role]).join(", ")}
              />
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
              <span className="user-role-options">
                {USER_ROLES.map((role) => (
                  <label key={role}>
                    <input
                      defaultChecked={user.roles.includes(role)}
                      name="roles"
                      type="checkbox"
                      value={role}
                    />
                    {ROLE_LABELS[role]}
                  </label>
                ))}
              </span>
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

      <div className="form-grid">
        <label>
          ตั้งรหัสผ่านใหม่ (ไม่บังคับ)
          <input
            autoComplete="new-password"
            minLength={6}
            name="newPassword"
            placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
            type="password"
          />
        </label>
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
  const showUserList = mode !== "view" && mode !== "edit" && mode !== "add";
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
  const adminCount = users.filter((user) => user.roles.includes("admin")).length;

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">ผู้บริหาร</p>
          <h1>จัดการข้อมูลผู้ใช้งาน</h1>
          <p className="dashboard-description">
            ดู แก้ไขสถานะ เปลี่ยนสิทธิ์การใช้งาน หรือลบบัญชีผู้ใช้ในระบบ
          </p>
        </div>
      </div>

      <div className="user-summary-grid">
        <article><span>ผู้ใช้ทั้งหมด</span><strong>{users.length}</strong></article>
        <article><span>บัญชีที่ใช้งาน</span><strong>{activeCount}</strong></article>
        <article><span>ผู้บริหาร</span><strong>{adminCount}</strong></article>
      </div>

      {showUserList ? (
        <div className="management-card">
          <div className="management-section-header user-list-header">
            <div><h2>รายชื่อผู้ใช้งาน</h2><p>{users.length} รายการ</p></div>
            <form aria-label="ค้นหาผู้ใช้งาน" className="user-inline-search" method="get">
              <input name="q" defaultValue={query} placeholder="ค้นหาชื่อหรืออีเมล" />
              <button className="management-primary-button" type="submit">ค้นหา</button>
              {query ? <Link href="/dashboard/users">ล้าง</Link> : null}
            </form>
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
                          <ProfileImage name={user.fullname} url={user.profileImageUrl} />
                          <strong>{user.fullname || "-"}</strong>
                          {isCurrentUser ? <small>บัญชีของคุณ</small> : null}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="user-role-badges">
                          {user.roles.map((role) => (
                            <span className="user-role-badge" key={role}>
                              {ROLE_LABELS[role]}
                            </span>
                          ))}
                        </div>
                      </td>
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
      ) : null}

      {mode === "view" && selectedUser ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>รายละเอียดผู้ใช้งาน</h2><p>{selectedUser.email}</p></div>
            <div className="user-detail-actions">
              <Link href="/dashboard/users">กลับไปรายชื่อ</Link>
              <Link href={`/dashboard/users?mode=edit&id=${selectedUser.id}`}>แก้ไขข้อมูล</Link>
            </div>
          </div>
          <UserProfile user={selectedUser} isCurrentUser={selectedUser.id === currentUserId} />
        </div>
      ) : null}

      {mode === "edit" && selectedUser ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>แก้ไขข้อมูลผู้ใช้งาน</h2><p>{selectedUser.fullname}</p></div>
            <Link href="/dashboard/users">กลับไปรายชื่อ</Link>
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

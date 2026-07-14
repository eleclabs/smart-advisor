import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";
import { approveTeacherAction, bulkApproveTeachersAction, committeeUpdateUserAction, committeeDeleteUserAction } from "@/actions/user.action";
import SchoolSearchInput from "@/components/forms/SchoolSearchInput";

type Props = {
  searchParams?: Promise<{
    mode?: string;
    id?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function CommitteeDashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "committee") redirect("/dashboard");

  // fetch approver's full record to get schoolId
  const approver = await UserRepository.findById(String(session.user.id));
  if (!approver || !approver.schoolId) {
    return (
      <section className="management-content">
        <div className="management-header">
          <div>
            <p className="dashboard-eyebrow">หัวหน้างานครูที่ปรึกษา</p>
            <h1>แดชบอร์ดการอนุมัติ</h1>
            <p className="dashboard-description">โปรดตั้งค่าโรงเรียนของคุณในโปรไฟล์ก่อนใช้งานหน้านี้</p>
          </div>
        </div>
      </section>
    );
  }

  const params = (await searchParams) ?? {};
  const mode = params.mode;
  const query = String(params.q || "").trim().toLowerCase();
  const statusFilter = String(params.status || "all");
  const selectedId = params.id;
  const isUserManagementMode = mode === "users";

  const users = await UserRepository.findBySchool(String(approver.schoolId));
  const schoolUsers = (users || []).filter((u: any) => {
    const roles = Array.isArray(u.roles) && u.roles.length ? u.roles : [u.role || "teacher"];
    return roles.some((role: string) => role === "teacher" || role === "committee");
  });
  const filteredUsers = schoolUsers.filter((u: any) => {
    const fullname = String(u.fullname || "").toLowerCase();
    const email = String(u.email || "").toLowerCase();
    const matchesQuery = !query || fullname.includes(query) || email.includes(query);
    const matchesStatus = statusFilter === "all"
      ? true
      : statusFilter === "pending"
        ? u.active === false
        : u.active === true;

    return matchesQuery && matchesStatus;
  });
  const pendingUsers = filteredUsers.filter((u: any) => u.active === false);
  let selectedUser: any = null;
  if (selectedId) {
    const found = await UserRepository.findById(String(selectedId));
    if (found) {
      const roles = Array.isArray(found.roles) && found.roles.length ? found.roles : [found.role || "teacher"];
      if (roles.some((role: string) => role === "teacher" || role === "committee")) {
        selectedUser = found;
      }
    }
  }

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">หัวหน้างานครูที่ปรึกษา</p>
          <h1>{isUserManagementMode ? "จัดการข้อมูลผู้ใช้งาน" : "รายการคำขอใช้งานของโรงเรียน"}</h1>
          <p className="dashboard-description">
            {isUserManagementMode
              ? "ดู แก้ไข ยืนยัน และจัดการครูในสถานศึกษาของคุณ"
              : "จัดการบัญชีผู้ใช้งานในสถานศึกษาของคุณ"}
          </p>
        </div>
      </div>

      <div className="user-summary-grid">
        <article><span>ครูทั้งหมด</span><strong>{schoolUsers.length}</strong></article>
        <article><span>คำขอใหม่</span><strong>{pendingUsers.length}</strong></article>
      </div>

      <div className="management-card">
        <div className="management-section-header user-list-header">
          <div><h2>รายชื่อครูในสถานศึกษา</h2><p>{filteredUsers.length} รายการ</p></div>
          <div className="screening-search" style={{ gridTemplateColumns: "minmax(0, 1fr) auto auto auto" }}>
            <form method="get" style={{ display: "contents" }}>
              <input name="q" defaultValue={query} placeholder="ค้นหาชื่อหรืออีเมล" />
              <select name="status" defaultValue={statusFilter}>
                <option value="all">ทั้งหมด</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รออนุมัติ</option>
              </select>
              <button className="management-primary-button" type="submit">ค้นหา</button>
              <Link href="/dashboard/committee">ล้าง</Link>
            </form>
          </div>
        </div>

        {pendingUsers.length > 0 ? (
          <form action={bulkApproveTeachersAction} style={{ marginBottom: 16 }}>
            {pendingUsers.map((user: any) => (
              <input key={String(user._id || user.id)} name="teacherIds" type="hidden" value={String(user._id || user.id)} />
            ))}
            <button className="management-primary-button" type="submit">อนุมัติทั้งหมดที่แสดง ({pendingUsers.length})</button>
          </form>
        ) : null}

        {filteredUsers.length === 0 ? (
          <p className="empty-state">ไม่มีครูในสถานศึกษานี้</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table user-table">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th><th>อีเมล</th><th>สิทธิ์</th><th>สถานะ</th><th>วันที่สมัคร</th><th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => {
                  const roles = Array.isArray(user.roles) && user.roles.length ? user.roles : [user.role || "teacher"];
                  return (
                    <tr key={String(user._id || user.id)}>
                      <td>
                        <div className="user-name-cell">
                          {user.profileImageUrl ? (
                            <Image alt={user.fullname} className="profile-image" src={user.profileImageUrl} width={80} height={80} />
                          ) : (
                            <div className="profile-image profile-image-placeholder">{(user.fullname || "").trim().charAt(0) || "U"}</div>
                          )}
                          <strong>{user.fullname}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{roles.map((r: string) => r).join(", ")}</td>
                      <td>{user.active ? "เปิดใช้งาน" : "รอการอนุมัติ"}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleString("th-TH") : "-"}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/dashboard/committee?mode=view&id=${String(user._id || user.id)}`}>ดู</Link>
                          <Link href={`/dashboard/committee?mode=edit&id=${String(user._id || user.id)}`}>แก้ไข</Link>
                          {roles.includes("teacher") && !user.active ? (
                            <form style={{ display: "inline" }} action={approveTeacherAction.bind(null, String(user._id || user.id))}>
                              <button type="submit">อนุมัติ</button>
                            </form>
                          ) : null}
                          {roles.includes("admin") || roles.includes("committee") ? null : (
                            <form style={{ display: "inline" }} action={committeeDeleteUserAction.bind(null, String(user._id || user.id))}>
                              <button type="submit">ลบ</button>
                            </form>
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
            <div><h2>ข้อมูลครูที่ปรึกษา</h2><p>{selectedUser.email}</p></div>
            <div className="user-detail-actions">
              <Link href="/dashboard/committee">กลับ</Link>
              <Link className="management-primary-button" href={`/dashboard/committee?mode=edit&id=${String(selectedUser._id || selectedUser.id)}`}>แก้ไขข้อมูล</Link>
            </div>
          </div>
          <div className="user-profile-detail">
            {selectedUser.profileImageUrl ? (
              <Image alt={selectedUser.fullname} className="profile-image profile-image-large" src={selectedUser.profileImageUrl} width={160} height={160} />
            ) : (
              <div className="profile-image profile-image-placeholder profile-image-large">{(selectedUser.fullname || "").trim().charAt(0) || "U"}</div>
            )}
          </div>
          <div className="dashboard-grid profile-grid" style={{ marginTop: 20 }}>
            <article className="dashboard-card profile-card"><span>ชื่อ-นามสกุล</span><strong>{selectedUser.fullname || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>คำนำหน้า</span><strong>{selectedUser.title || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>เพศ</span><strong>{selectedUser.gender || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>ชื่อ (ไทย)</span><strong>{selectedUser.firstNameTh || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>นามสกุล (ไทย)</span><strong>{selectedUser.lastNameTh || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>ชื่อ (อังกฤษ)</span><strong>{selectedUser.firstNameEn || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>นามสกุล (อังกฤษ)</span><strong>{selectedUser.lastNameEn || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>อีเมล</span><strong>{selectedUser.email || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>เบอร์โทร</span><strong>{selectedUser.phone || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>รหัสประชาชน</span><strong>{selectedUser.citizenId || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>ภูมิภาค</span><strong>{selectedUser.region || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>จังหวัด</span><strong>{selectedUser.province || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>สำนักงานอาชีวศึกษาจังหวัด</span><strong>{selectedUser.vocationalOffice || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>ประเภทสถานศึกษา</span><strong>{selectedUser.educationType || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>จังหวัดของสถานศึกษา</span><strong>{selectedUser.schoolProvince || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>สถานศึกษา</span><strong>{selectedUser.schoolName || "-"}</strong></article>
            <article className="dashboard-card profile-card"><span>สิทธิ์การใช้งาน</span><strong>{(() => { const r = Array.isArray(selectedUser.roles) && selectedUser.roles.length ? selectedUser.roles : [selectedUser.role || "teacher"]; return r.map((x: string) => ROLE_LABELS[x as keyof typeof ROLE_LABELS] || x).join(", "); })()}</strong></article>
            <article className="dashboard-card profile-card"><span>สถานะบัญชี</span><strong>{selectedUser.active ? "เปิดใช้งาน" : "รอการอนุมัติ"}</strong></article>
            <article className="dashboard-card profile-card"><span>วันที่สมัคร</span><strong>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("th-TH") : "-"}</strong></article>
          </div>
        </div>
      ) : null}

      {mode === "edit" && selectedUser ? (
        <div className="management-card">
          <div className="management-section-header">
            <div><h2>แก้ไขข้อมูลครูที่ปรึกษา</h2><p>{selectedUser.fullname}</p></div>
            <Link href="/dashboard/committee">กลับ</Link>
          </div>
          <form className="management-form compact-form" action={committeeUpdateUserAction.bind(null, String(selectedUser._id || selectedUser.id))} encType="multipart/form-data">
            <div className="profile-edit-top">
              <div className="profile-edit-avatar">
                {selectedUser.profileImageUrl ? (
                  <Image alt={selectedUser.fullname} className="profile-image" src={selectedUser.profileImageUrl} width={112} height={112} />
                ) : (
                  <div className="profile-image profile-image-placeholder profile-image-large">{(selectedUser.fullname || "").trim().charAt(0) || "U"}</div>
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{selectedUser.fullname}</p>
                <p className="profile-edit-note">{selectedUser.email}</p>
              </div>
            </div>
            <div className="form-grid compact-grid">
              <label>ชื่อ-นามสกุล<input name="fullname" defaultValue={selectedUser.fullname || ""} required /></label>
              <label>คำนำหน้า<input name="title" defaultValue={selectedUser.title || ""} /></label>
              <label>เพศ<input name="gender" defaultValue={selectedUser.gender || ""} /></label>
              <label>ชื่อ (ไทย)<input name="firstNameTh" defaultValue={selectedUser.firstNameTh || ""} /></label>
              <label>นามสกุล (ไทย)<input name="lastNameTh" defaultValue={selectedUser.lastNameTh || ""} /></label>
              <label>ชื่อ (อังกฤษ)<input name="firstNameEn" defaultValue={selectedUser.firstNameEn || ""} /></label>
              <label>นามสกุล (อังกฤษ)<input name="lastNameEn" defaultValue={selectedUser.lastNameEn || ""} /></label>
              <label>เบอร์โทร<input name="phone" defaultValue={selectedUser.phone || ""} /></label>
              <label>รหัสประชาชน<input name="citizenId" defaultValue={selectedUser.citizenId || ""} /></label>
              <label>จังหวัด<input name="province" defaultValue={selectedUser.province || ""} /></label>
              <label>
                สิทธิ์การใช้งาน
                <div className="user-role-options">
                  {(["teacher", "committee"] as const).map((roleOption) => {
                    const userRoles = Array.isArray(selectedUser.roles) && selectedUser.roles.length ? selectedUser.roles : [selectedUser.role || "teacher"];
                    return (
                      <label key={roleOption}>
                        <input defaultChecked={userRoles.includes(roleOption)} name="roles" type="checkbox" value={roleOption} />
                        {roleOption === "teacher" ? "ครูที่ปรึกษา" : "หัวหน้างานครูที่ปรึกษา"}
                      </label>
                    );
                  })}
                </div>
              </label>
              <label>
                สถานะบัญชี
                <select name="active" defaultValue={String(selectedUser.active)}>
                  <option value="true">เปิดใช้งาน</option>
                  <option value="false">ปิดใช้งาน</option>
                </select>
              </label>
              <SchoolSearchInput
                defaultSchoolId={selectedUser.schoolId ? String(selectedUser.schoolId) : ""}
                defaultSchoolName={selectedUser.schoolName || ""}
                defaultSchoolProvince={selectedUser.schoolProvince || ""}
                defaultRegion={selectedUser.region || ""}
                defaultVocationalOffice={selectedUser.vocationalOffice || ""}
                defaultEducationType={selectedUser.educationType || ""}
              />
              <label className="full-width-field">
                รูปโปรไฟล์
                <input accept=".jpg,.jpeg,.png,.webp,image/*" name="profileImage" type="file" />
              </label>
              {selectedUser.profileImageUrl ? (
                <label className="profile-remove-option full-width-field">
                  <input name="removeProfileImage" type="checkbox" value="true" /> ลบรูปโปรไฟล์ปัจจุบัน
                </label>
              ) : null}
            </div>
            <div className="screening-form-actions compact-actions">
              <button className="management-primary-button" type="submit">บันทึกการแก้ไข</button>
            </div>
          </form>
        </div>
      ) : null}

    </section>
  );
}

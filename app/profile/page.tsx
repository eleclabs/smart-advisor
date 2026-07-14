import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { isUserRole, ROLE_LABELS } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";
import { updateOwnProfileAction, deleteOwnAccountAction } from "@/actions/user.action";

type Props = {
  searchParams?: {
    mode?: string;
  };
};

export default async function ProfilePage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await UserRepository.findById(String(session.user.id));
  if (!user) redirect("/dashboard");

  const sessionRole = session.user.role || "teacher";
  const roleLabel = isUserRole(sessionRole) ? ROLE_LABELS[sessionRole] : "ผู้ใช้งาน";
  const mode = searchParams?.mode;

  return (
    <section className="dashboard-page profile-page-shell">
      <div className="dashboard-header profile-header">
        <div>
          <p className="dashboard-eyebrow">ข้อมูลส่วนตัว</p>
          <h1>{user.fullname || session.user.name || "ผู้ใช้งาน"}</h1>
          <p className="dashboard-description">ข้อมูลพื้นฐานและข้อมูลติดต่อของครูที่ปรึกษาในระบบ</p>
        </div>
      </div>

      {mode !== "edit" ? (
        <div className="profile-page-content">
          <div className="profile-hero">
            <div className="profile-hero-avatar">
              {user.profileImageUrl ? (
                <Image alt={user.fullname || "profile"} src={user.profileImageUrl} width={160} height={160} className="profile-image profile-image-large" />
              ) : (
                <div className="profile-image profile-image-placeholder profile-image-large">{(user.fullname || "").trim().charAt(0) || "U"}</div>
              )}
            </div>
            <div className="profile-hero-content">
              <h2>{user.fullname || "-"}</h2>
              <div className="profile-hero-meta">
                <span>{roleLabel}</span>
                {user.schoolName ? <span>{user.schoolName}</span> : null}
                {user.email ? <span>{user.email}</span> : null}
              </div>
            </div>
            <div className="profile-actions">
              <Link href="/profile/edit" className="management-primary-button">แก้ไขข้อมูล</Link>
              <form action={deleteOwnAccountAction}>
                <button className="management-secondary-link" type="submit">ลบบัญชี</button>
              </form>
            </div>
          </div>

          <div className="dashboard-grid profile-grid">
            <article className="dashboard-card profile-card">
              <span>ชื่อ-นามสกุล</span>
              <strong>{user.fullname || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>คำนำหน้า</span>
              <strong>{user.title || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>เพศ</span>
              <strong>{user.gender || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>ชื่อ(ไทย)</span>
              <strong>{user.firstNameTh || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>นามสกุล(ไทย)</span>
              <strong>{user.lastNameTh || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>ชื่อ(อังกฤษ)</span>
              <strong>{user.firstNameEn || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>นามสกุล(อังกฤษ)</span>
              <strong>{user.lastNameEn || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>อีเมล</span>
              <strong>{user.email || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>เบอร์โทร</span>
              <strong>{user.phone || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>รหัสประชาชน</span>
              <strong>{user.citizenId || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>ภูมิภาค</span>
              <strong>{user.region || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>จังหวัด</span>
              <strong>{user.province || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>สำนักงานอาชีวศึกษาจังหวัด</span>
              <strong>{user.vocationalOffice || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>ประเภทสถานศึกษา</span>
              <strong>{user.educationType || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>จังหวัดของสถานศึกษา</span>
              <strong>{user.schoolProvince || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>สถานศึกษา</span>
              <strong>{user.schoolName || "-"}</strong>
            </article>

            <article className="dashboard-card profile-card">
              <span>สิทธิ์การใช้งาน</span>
              <strong>{roleLabel}</strong>
            </article>
          </div>
        </div>
      ) : (
        <div className="management-card profile-form-card">
          <div className="management-section-header">
            <div><h2>แก้ไขข้อมูลส่วนตัว</h2></div>
          </div>
          <form className="management-form" action={updateOwnProfileAction} encType="multipart/form-data">
            <div className="form-grid">
              <label>
                ชื่อ-นามสกุล
                <input name="fullname" defaultValue={user.fullname} required />
              </label>
              <label>
                คำนำหน้า
                <input name="title" defaultValue={user.title || ""} />
              </label>
              <label>
                เพศ
                <input name="gender" defaultValue={user.gender || ""} />
              </label>
              <label>
                ชื่อ (ไทย)
                <input name="firstNameTh" defaultValue={user.firstNameTh || ""} />
              </label>
              <label>
                นามสกุล (ไทย)
                <input name="lastNameTh" defaultValue={user.lastNameTh || ""} />
              </label>
              <label>
                ชื่อ (อังกฤษ)
                <input name="firstNameEn" defaultValue={user.firstNameEn || ""} />
              </label>
              <label>
                นามสกุล (อังกฤษ)
                <input name="lastNameEn" defaultValue={user.lastNameEn || ""} />
              </label>
              <label>
                อีเมล
                <input name="email" type="email" defaultValue={user.email || ""} disabled />
              </label>
              <label>
                เบอร์โทร
                <input name="phone" defaultValue={user.phone || ""} />
              </label>
              <label>
                รหัสประชาชน
                <input name="citizenId" defaultValue={user.citizenId || ""} />
              </label>
              <label>
                กระทรวง
                <input name="ministry" defaultValue={user.ministry || ""} />
              </label>
              <label>
                กรม/หน่วยงาน
                <input name="ministryAgency" defaultValue={user.ministryAgency || ""} />
              </label>
              <label>
                องค์กร
                <input name="organization" defaultValue={user.organization || ""} />
              </label>
              <label>
                กอง/ฝ่าย
                <input name="division" defaultValue={user.division || ""} />
              </label>
              <label>
                ภูมิภาค
                <input name="region" defaultValue={user.region || ""} />
              </label>
              <label>
                จังหวัด
                <input name="province" defaultValue={user.province || ""} />
              </label>
              <label>
                สำนักงานอาชีวศึกษาจังหวัด
                <input name="vocationalOffice" defaultValue={user.vocationalOffice || ""} />
              </label>
              <label>
                ประเภทสถานศึกษา
                <input name="educationType" defaultValue={user.educationType || ""} />
              </label>
              <label>
                จังหวัดของสถานศึกษา
                <input name="schoolProvince" defaultValue={user.schoolProvince || ""} />
              </label>
              <label>
                สถานศึกษา
                <input name="schoolName" defaultValue={user.schoolName || ""} />
                <input name="schoolId" type="hidden" defaultValue={String(user.schoolId || "")} />
              </label>
              <label>
                รูปโปรไฟล์
                <input accept=".jpg,.jpeg,.png,.webp,image/*" name="profileImage" type="file" />
              </label>
              {user.profileImageUrl ? (
                <label className="profile-remove-option">
                  <input name="removeProfileImage" type="checkbox" value="true" /> ลบรูปโปรไฟล์ปัจจุบัน
                </label>
              ) : null}
            </div>
            <div className="screening-form-actions">
              <button className="management-primary-button" type="submit">บันทึกข้อมูล</button>
              <Link href="/profile">ยกเลิก</Link>
            </div>
          </form>
        </div>
      )}

    </section>
  );
}

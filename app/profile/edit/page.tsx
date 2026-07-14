import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRepository } from "@/repositories/user.repository";
import { updateOwnProfileAction } from "@/actions/user.action";
import SchoolSearchInput from "@/components/forms/SchoolSearchInput";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await UserRepository.findById(String(session.user.id));
  if (!user) {
    redirect("/dashboard");
  }

  return (
    <section className="management-content">
      <div className="management-header">
        <div>
          <p className="dashboard-eyebrow">ข้อมูลส่วนตัว</p>
          <h1>แก้ไขข้อมูลครูที่ปรึกษา</h1>
          <p className="dashboard-description">ปรับปรุงข้อมูลส่วนตัวและอัปโหลดรูปโปรไฟล์ใหม่ของคุณ</p>
        </div>
      </div>

      <div className="management-card profile-form-card">
        <form className="management-form compact-form" action={updateOwnProfileAction} encType="multipart/form-data">
          <div className="profile-edit-top">
            <div className="profile-edit-avatar">
              {user.profileImageUrl ? (
                <Image
                  alt={user.fullname || "โปรไฟล์"}
                  src={user.profileImageUrl}
                  width={112}
                  height={112}
                  className="profile-image"
                />
              ) : (
                <div className="profile-image profile-image-placeholder profile-image-large">
                  {(user.fullname || "").trim().charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h2>แก้ไขข้อมูลครูที่ปรึกษา</h2>
              <p className="profile-edit-note">ปรับข้อมูลส่วนตัวและอัปโหลดรูปโปรไฟล์เพื่อแสดงบนหน้าข้อมูลผู้ใช้งาน</p>
            </div>
          </div>
          <div className="form-grid compact-grid">
            <label>
              ชื่อ-นามสกุล
              <input name="fullname" defaultValue={user.fullname || ""} required />
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
              เบอร์โทร
              <input name="phone" defaultValue={user.phone || ""} />
            </label>
            <label>
              รหัสประชาชน
              <input name="citizenId" defaultValue={user.citizenId || ""} />
            </label>
            <label>
              จังหวัด
              <input name="province" defaultValue={user.province || ""} />
            </label>
            <SchoolSearchInput
              defaultSchoolId={user.schoolId ? String(user.schoolId) : ""}
              defaultSchoolName={user.schoolName || ""}
              defaultSchoolProvince={user.schoolProvince || ""}
              defaultRegion={user.region || ""}
              defaultVocationalOffice={user.vocationalOffice || ""}
              defaultEducationType={user.educationType || ""}
            />
            <label className="full-width-field">
              รูปโปรไฟล์
              <input accept=".jpg,.jpeg,.png,.webp,image/*" name="profileImage" type="file" />
            </label>
            {user.profileImageUrl ? (
              <label className="profile-remove-option full-width-field">
                <input name="removeProfileImage" type="checkbox" value="true" /> ลบรูปโปรไฟล์ปัจจุบัน
              </label>
            ) : null}
          </div>

          <div className="screening-form-actions compact-actions">
            <button className="management-primary-button" type="submit">บันทึกข้อมูล</button>
            <Link href="/profile" className="management-secondary-link">กลับ</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

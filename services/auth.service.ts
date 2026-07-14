import bcrypt from "bcrypt";
import crypto from "crypto";
import { isUserRole, type UserRole } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";

type RegisterData = {
  fullname?: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  roles: FormDataEntryValue[];
  gender?: FormDataEntryValue | null;
  title?: FormDataEntryValue | null;
  firstNameTh?: FormDataEntryValue | null;
  lastNameTh?: FormDataEntryValue | null;
  firstNameEn?: FormDataEntryValue | null;
  lastNameEn?: FormDataEntryValue | null;
  phone?: FormDataEntryValue | null;
  citizenId?: FormDataEntryValue | null;
  region?: FormDataEntryValue | null;
  province?: FormDataEntryValue | null;
  vocationalOffice?: FormDataEntryValue | null;
  educationType?: FormDataEntryValue | null;
  schoolProvince?: FormDataEntryValue | null;
  schoolId?: FormDataEntryValue | null;
  schoolName?: FormDataEntryValue | null;
};

type CredentialsData = {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  role?: FormDataEntryValue | null;
};

export class AuthService {

  static getUserRoles(user: { role?: unknown; roles?: unknown }): UserRole[] {
    const roles = Array.isArray(user.roles)
      ? user.roles.map(String).filter(isUserRole)
      : [];
    const legacyRole = String(user.role || "");

    if (roles.length === 0 && isUserRole(legacyRole)) {
      return [legacyRole];
    }

    return Array.from(new Set(roles));
  }

  static async register(data: RegisterData) {
    const gender = String(data.gender || "").trim();
    const title = String(data.title || "").trim();
    const firstNameTh = String(data.firstNameTh || "").trim();
    const lastNameTh = String(data.lastNameTh || "").trim();
    const firstNameEn = String(data.firstNameEn || "").trim();
    const lastNameEn = String(data.lastNameEn || "").trim();
    const phone = String(data.phone || "").trim();
    const citizenId = String(data.citizenId || "").trim();
    const region = String(data.region || "").trim();
    const province = String(data.province || "").trim();
    const vocationalOffice = String(data.vocationalOffice || "").trim();
    const educationType = String(data.educationType || "").trim();
    const schoolProvince = String(data.schoolProvince || "").trim();
    const schoolId = String(data.schoolId || "").trim();
    const schoolName = String(data.schoolName || "").trim();
    const fullname = String(data.fullname || `${firstNameTh} ${lastNameTh}`.trim()).trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const requestedRoles = data.roles.map(String).filter(isUserRole);
    // Self-registration may only create a `teacher` role. Other roles must be granted by an approver.
    const requestedSelfRoles = requestedRoles.filter((r) => r === "teacher");
    const rolesToRegister = Array.from(new Set(requestedSelfRoles.length ? requestedSelfRoles : ["teacher"]));

    if (
      !gender ||
      !title ||
      !firstNameTh ||
      !lastNameTh ||
      !firstNameEn ||
      !lastNameEn ||
      !email ||
      !password ||
      !phone ||
      !citizenId ||
      !region ||
      !province ||
      !vocationalOffice ||
      !educationType ||
      !schoolProvince
    ) {
      return {
        ok: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน"
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
      };
    }

    // Registration proceeds as a teacher by default; account remains inactive until approved.

    const exist =
      await UserRepository.findByEmail(
        email
      );

    if (exist) {
      const validPassword = exist.password
        ? await bcrypt.compare(password, exist.password)
        : false;

      if (!validPassword) {
        return {
          ok: false,
          message: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาใช้รหัสผ่านเดิมเพื่อเพิ่มบทบาท"
        };
      }

      const roles = this.getUserRoles(exist);
      const newRoles = rolesToRegister.filter((role) => !roles.includes(role as UserRole));
      if (newRoles.length === 0) {
        return {
          ok: false,
          message: "บัญชีนี้มีบทบาทที่เลือกอยู่แล้ว"
        };
      }

      await UserRepository.setRoles(email, [...roles, ...newRoles]);
      return {
        ok: true,
        message: "เพิ่มบทบาทให้บัญชีเดิมสำเร็จ"
      };
    }

    const hash =
      await bcrypt.hash(
        password,
        10
      );

    await UserRepository.create({
      fullname,
      email,
      role: rolesToRegister[0],
      roles: rolesToRegister,
      active: false,
      password: hash,
      gender,
      title,
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      phone,
      citizenId,
      region,
      province,
      vocationalOffice,
      educationType,
      schoolProvince,
      schoolId,
      schoolName
    });

    return {
      ok: true,
      message: "สมัครสมาชิกสำเร็จ"
    };
  }

  static async validateCredentials(data: CredentialsData) {
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const requestedRole = String(data.role || "").trim();

    if (!email || !password) {
      return {
        ok: false,
        message: "กรุณากรอกอีเมลและรหัสผ่าน"
      };
    }

    const user = await UserRepository.findByEmail(email);

    if (!user || !user.password) {
      return {
        ok: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      };
    }

    if (!user.active) {
      return {
        ok: false,
        message: "บัญชีนี้ถูกปิดใช้งาน"
      };
    }

    const roles = this.getUserRoles(user);
    if (roles.length === 0) {
      return {
        ok: false,
        message: "บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ"
      };
    }

    if (!isUserRole(requestedRole) || !roles.includes(requestedRole)) {
      return {
        ok: false,
        message: "บทบาทที่เลือกไม่ตรงกับบัญชีผู้ใช้งาน"
      };
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return {
        ok: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      };
    }

    return {
      ok: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user
      ,
      role: requestedRole,
      roles
    };
  }

  static async createPasswordResetToken(emailValue: FormDataEntryValue | null) {
    const email = String(emailValue || "").trim().toLowerCase();

    if (!email) {
      return {
        ok: false,
        message: "กรุณากรอกอีเมล"
      };
    }

    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return {
        ok: false,
        message: "ไม่พบบัญชีผู้ใช้อีเมลนี้"
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);

    await UserRepository.setPasswordResetToken(
      email,
      passwordResetToken,
      passwordResetExpires
    );

    return {
      ok: true,
      message: "สร้าง reset token สำเร็จ",
      resetToken
    };
  }

}

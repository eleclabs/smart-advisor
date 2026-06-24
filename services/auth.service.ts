import bcrypt from "bcrypt";
import crypto from "crypto";
import { isUserRole, type UserRole } from "@/lib/roles";
import { UserRepository } from "@/repositories/user.repository";

type RegisterData = {
  fullname: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  roles: FormDataEntryValue[];
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
    const fullname = String(data.fullname || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const requestedRoles = data.roles.map(String).filter(isUserRole);
    const rolesToRegister = Array.from(new Set(requestedRoles));

    if (!fullname || !email || !password) {
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

    if (rolesToRegister.length === 0) {
      return {
        ok: false,
        message: "สามารถสมัครได้เฉพาะครูที่ปรึกษา หัวหน้างานครูที่ปรึกษา หรือผู้บริหาร"
      };
    }

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
      const newRoles = rolesToRegister.filter((role) => !roles.includes(role));
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

      password: hash

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

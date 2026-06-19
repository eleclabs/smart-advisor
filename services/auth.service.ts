import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserRepository } from "@/repositories/user.repository";
import { isUserRole } from "@/lib/roles";

type RegisterData = {
  fullname: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  role: FormDataEntryValue | null;
};

type CredentialsData = {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
};

export class AuthService {

  static async register(data: RegisterData) {
    const fullname = String(data.fullname || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const role = String(data.role || "student");

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

    if (!isUserRole(role)) {
      return {
        ok: false,
        message: "บทบาทผู้ใช้ไม่ถูกต้อง"
      };
    }

    const exist =
      await UserRepository.findByEmail(
        email
      );

    if (exist) {
      return {
        ok: false,
        message: "อีเมลนี้ถูกใช้งานแล้ว"
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
      role,

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

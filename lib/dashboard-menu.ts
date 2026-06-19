import type { UserRole } from "@/lib/roles";

export type DashboardItem = {
  label: string;
  value: string;
  href?: string;
};

export type RoleDashboard = {
  title: string;
  description: string;
  menuTitle: string;
  items: DashboardItem[];
};

export const roleDashboards: Record<UserRole, RoleDashboard> = {
  admin: {
    title: "หน้าหลักผู้ดูแลระบบ",
    description: "จัดการข้อมูลหลักของระบบ Smart Advisor",
    menuTitle: "เมนูการจัดการ",
    items: [
      {
        label: "จัดการข้อมูลผู้ใช้งาน",
        value: "ดู แก้ไข เปลี่ยนสิทธิ์ และลบบัญชีผู้ใช้งาน",
        href: "/dashboard/users"
      },
      {
        label: "การรู้จักผู้เรียนเป็นรายบุคคล",
        value: "ดู เพิ่ม แก้ไข และลบข้อมูลผู้เรียนทั้งหมดในระบบ",
        href: "/dashboard/student"
      },
      {
        label: "การคัดกรองผู้เรียน",
        value: "ค้นหาและจัดการแบบคัดกรองผู้เรียนรายภาคเรียน",
        href: "/dashboard/screening"
      },
      {
        label: "การส่งเสริมและพัฒนาผู้เรียน",
        value: "วางแผนและจัดการกิจกรรมส่งเสริมผู้เรียน",
        href: "/dashboard/activity"
      },
      {
        label: "การป้องกันและแก้ปัญหา",
        value: "จัดทำและติดตามแผนดูแลช่วยเหลือผู้เรียน",
        href: "/dashboard/intervention"
      },
      {
        label: "การส่งต่อผู้เรียน",
        value: "บันทึกการประสานงานและติดตามผลการส่งต่อผู้เรียน",
        href: "/dashboard/referral"
      }
    ]
  },
  teacher: {
    title: "หน้าหลักครูที่ปรึกษา",
    description: "ติดตาม ดูแล ส่งเสริม และช่วยเหลือผู้เรียนในความดูแล",
    menuTitle: "เมนูครูที่ปรึกษา",
    items: [
      {
        label: "การรู้จักผู้เรียนเป็นรายบุคคล",
        value: "บันทึกและตรวจสอบข้อมูลพื้นฐานของผู้เรียนแต่ละคน",
        href: "/dashboard/student"
      },
      {
        label: "การคัดกรองผู้เรียน",
        value: "ประเมินและจัดกลุ่มผู้เรียนตามข้อมูลการดูแลช่วยเหลือ",
        href: "/dashboard/screening"
      },
      {
        label: "การส่งเสริมและพัฒนาผู้เรียน",
        value: "วางแผนกิจกรรมเพื่อส่งเสริมศักยภาพของผู้เรียน",
        href: "/dashboard/activity"
      },
      {
        label: "การป้องกันและแก้ปัญหา",
        value: "ติดตามปัญหาและกำหนดแนวทางช่วยเหลือผู้เรียน",
        href: "/dashboard/intervention"
      },
      {
        label: "การส่งต่อผู้เรียน",
        value: "ส่งต่อข้อมูลผู้เรียนไปยังผู้เกี่ยวข้องเพื่อดูแลต่อเนื่อง",
        href: "/dashboard/referral"
      }
    ]
  },
  student: {
    title: "หน้าหลักผู้เรียน",
    description: "ดูข้อมูลส่วนตัว ครูที่ปรึกษา และความก้าวหน้าทางการเรียน",
    menuTitle: "เมนูผู้เรียน",
    items: [
      { label: "ครูที่ปรึกษา", value: "ตรวจสอบข้อมูลครูที่ปรึกษา" },
      { label: "แผนการเรียน", value: "ตรวจสอบความก้าวหน้าทางการเรียน" },
      { label: "คำร้อง", value: "ส่งคำร้องขอรับคำปรึกษา" }
    ]
  },
  committee: {
    title: "หน้าหลักคณะกรรมการ",
    description: "ตรวจสอบการดำเนินงาน การอนุมัติ และรายงานสรุป",
    menuTitle: "เมนูคณะกรรมการ",
    items: [
      { label: "การอนุมัติ", value: "ตรวจสอบคำร้องที่รอการอนุมัติ" },
      { label: "ภาพรวมการให้คำปรึกษา", value: "ติดตามการดำเนินงานให้คำปรึกษา" },
      { label: "รายงานคณะกรรมการ", value: "ดูรายงานสรุปผลการพิจารณา" }
    ]
  }
};

export function createSectionId(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

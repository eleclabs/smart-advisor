export const USER_ROLES = [
  "admin",
  "teacher",
  "student",
  "committee"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "ผู้ดูแลระบบ",
  teacher: "ครูที่ปรึกษา",
  student: "ผู้เรียน",
  committee: "คณะกรรมการ"
};

export function isUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

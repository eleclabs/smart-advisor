export const USER_ROLES = [
  "admin",
  "teacher",
  "committee"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "ผู้บริหาร",
  teacher: "ครูที่ปรึกษา",
  committee: "หัวหน้างานครูที่ปรึกษา"
};

export function isUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

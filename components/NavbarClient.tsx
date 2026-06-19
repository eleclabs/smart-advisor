"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/actions/auth.action";
import { isUserRole, ROLE_LABELS } from "@/lib/roles";

type NavbarUser = {
  name: string;
  role: string;
};

type NavbarClientProps = {
  user: NavbarUser | null;
};

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = Boolean(user);
  const roleLabel = user && isUserRole(user.role)
    ? ROLE_LABELS[user.role]
    : "ผู้ใช้งาน";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          Smart Advisor
        </Link>

        <button
          aria-label="เปิดหรือปิดเมนู"
          className="menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          เมนู
        </button>

        <ul className={menuOpen ? "nav-links active" : "nav-links"}>
          <li>
            <Link href="/">หน้าหลัก</Link>
          </li>

          <li>
            <Link href="/about">เกี่ยวกับเรา</Link>
          </li>

          <li>
            <Link href="/contact">ติดต่อเรา</Link>
          </li>

          {isLoggedIn ? (
            <>
              <li>
                <Link href="/dashboard">ระบบงาน</Link>
              </li>

              <li>
                <Link className="user-info" href="/profile">
                  {user?.name} ({roleLabel})
                </Link>
              </li>

              <li>
                <form action={logoutAction}>
                  <button
                    aria-label="ออกจากระบบ"
                    className="nav-logout"
                    title="ออกจากระบบ"
                    type="submit"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="20"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path
                        d="M15 17l5-5-5-5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 12H9"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 19H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h7"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login">เข้าสู่ระบบ</Link>
              </li>

              <li>
                <Link href="/register">สมัครสมาชิก</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

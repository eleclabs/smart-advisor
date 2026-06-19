import { auth } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const session = await auth();

  return (
    <NavbarClient
      user={
        session?.user
          ? {
              name: session.user.name || "User",
              role: session.user.role || "student"
            }
          : null
      }
    />
  );
}

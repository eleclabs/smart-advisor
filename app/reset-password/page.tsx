import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = String(params?.token || "");

  return <ResetPasswordForm token={token} />;
}

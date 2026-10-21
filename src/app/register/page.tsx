import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  return <AuthForm mode="register" />;
}

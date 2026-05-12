import { JoinForm } from "@/components/auth/join-form";
import { Metadata } from "next";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Join Debo",
  description: "Get started with your intelligent AI companion.",
};

export default async function JoinPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <JoinForm />
    </div>
  );
}

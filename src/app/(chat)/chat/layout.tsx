import { resolveUserId } from "@/actions/auth-sync";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat",
  description: "Talk with Debo and keep every conversation addressable.",
};

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await resolveUserId();

  if (!userId) {
    redirect("/join");
  }

  return children;
}

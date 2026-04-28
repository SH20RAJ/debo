import { JoinForm } from "@/components/auth/join-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Debo",
  description: "Get started with your intelligent AI companion.",
};

export default function JoinPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <JoinForm />
    </div>
  );
}

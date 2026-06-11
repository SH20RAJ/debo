import { MailShell } from "@/components/mail/mail-shell";

export const metadata = {
  title: "Debo Mail",
  description: "Your private Debo identity and internal memory-aware inbox.",
};

export default function MailPage() {
  return <MailShell />;
}

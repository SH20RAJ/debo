import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";

const STACK_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID) &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "ffffffff-ffff-ffff-ffff-ffffffffffff";

export default async function Home() {
  if (!STACK_CONFIGURED) {
    redirect("/dashboard");
  }
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/handler/sign-in");
  }
}

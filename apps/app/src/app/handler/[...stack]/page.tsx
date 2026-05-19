import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export default function HandlerPage(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props as any} />;
}

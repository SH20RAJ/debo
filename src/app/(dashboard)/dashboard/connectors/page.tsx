import { getComposioActiveApps } from "@/actions/composio";
import { ConnectorsList } from "@/components/dashboard/connectors/connectors-list";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connectors",
  description: "Connect your apps to Debo.",
};

export default async function ConnectorsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const composioApps = await getComposioActiveApps();

  return (
    <div className="flex-1 bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="duo-card grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-duo-wolf">
              Power up
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-duo-eel md:text-6xl">
              Connectors
            </h1>
            <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-duo-wolf">
              Debo can use connected apps after you approve them.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-duo-feather bg-duo-green/10 px-4 py-3 text-sm font-black text-duo-green">
            Active apps
          </div>
        </header>

        <ConnectorsList 
          composioApps={composioApps} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}

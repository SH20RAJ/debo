import { Suspense, type ReactNode } from "react";
import { AgentChatBootstrapSync } from "@/app/agents/_components/agent-chat-bootstrap-sync";
import { AgentChatShell } from "@/app/agents/_components/agent-chat-shell";
import { listChatsPageByUser } from "@/app/agents/lib/db/queries";
import { getServerViewer } from "@/app/agents/lib/session";
import { getInitialSetupStatus, getSetupStatus } from "@/app/agents/lib/setup";

export default function ChatLayout({ children }: { readonly children: ReactNode }) {
  const setupStatus = getInitialSetupStatus();

  return (
    <AgentChatShell
      initialChats={[]}
      initialNextCursor={null}
      setupStatus={setupStatus}
      viewer={null}
    >
      {children}
      <div className="hidden" aria-hidden>
        <Suspense fallback={null}>
          <ResolvedChatBootstrap />
        </Suspense>
      </div>
    </AgentChatShell>
  );
}

async function ResolvedChatBootstrap() {
  const setupStatus = await getSetupStatus();
  const viewer = await getServerViewer(setupStatus);
  const appReady = setupStatus.appReady;
  const initialChatsPage =
    viewer && appReady
      ? await listChatsPageByUser(viewer.id)
      : { items: [], nextCursor: null };

  return (
    <AgentChatBootstrapSync
      chats={initialChatsPage.items}
      nextCursor={initialChatsPage.nextCursor}
      setupStatus={setupStatus}
      viewer={viewer}
    />
  );
}

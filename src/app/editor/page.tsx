import { LaunchPreview } from "@/components/landing/LaunchPreview";
import { EditorPageClient } from "@/components/editor/editor-page-client";

const isPublicPreviewDeploy = process.env.NODE_ENV === "production";

export default function Page() {
  if (isPublicPreviewDeploy) {
    return <LaunchPreview label="Debo Editor" />;
  }

  return <EditorPageClient />;
}

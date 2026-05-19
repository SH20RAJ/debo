import { Hono } from "hono";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.post("/presign", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { sourceId, filename, contentType } = body;

  // Stub: return a mock presigned URL
  // Real implementation: const url = await getPresignedUploadUrl(key, contentType);
  const key = `workspaces/${ctx.workspaceId}/users/${ctx.userId}/sources/${sourceId}/original/${filename}`;

  return c.json({
    uploadUrl: `https://r2.example.com/presigned/${key}`,
    key,
    message: "Presigned URL stub — configure R2 credentials to enable",
  });
});

app.get("/download/*", async (c) => {
  const key = c.req.path.replace("/api/uploads/download/", "");
  return c.json({
    downloadUrl: `https://r2.example.com/download/${key}`,
    message: "Download URL stub — configure R2 credentials to enable",
  });
});

export default app;

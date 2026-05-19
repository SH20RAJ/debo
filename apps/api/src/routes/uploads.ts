import { Hono } from "hono";
import { getAppContext } from "../lib/context";
import {
  isR2Configured,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteObject,
  sourceOriginalKey,
} from "@debo/storage";

const app = new Hono();

app.post("/presign", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { sourceId, filename, contentType } = body;

  const key = sourceOriginalKey(
    ctx.workspaceId,
    ctx.userId,
    sourceId,
    filename,
  );

  if (!isR2Configured()) {
    return c.json({
      uploadUrl: `https://r2.example.com/presigned/${key}`,
      key,
      message:
        "Presigned URL stub — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME to enable",
    });
  }

  const uploadUrl = await getPresignedUploadUrl(key, contentType);
  return c.json({ uploadUrl, key });
});

app.get("/download/*", async (c) => {
  const key = c.req.path.replace("/api/uploads/download/", "");

  if (!isR2Configured()) {
    return c.json({
      downloadUrl: `https://r2.example.com/download/${key}`,
      message:
        "Download URL stub — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME to enable",
    });
  }

  const downloadUrl = await getPresignedDownloadUrl(key);
  return c.json({ downloadUrl, key });
});

app.delete("/*", async (c) => {
  const key = c.req.path.replace("/api/uploads/", "");

  if (!isR2Configured()) {
    return c.json({
      message: "Delete stub — R2 credentials not configured",
    });
  }

  await deleteObject(key);
  return c.json({ deleted: true, key });
});

export default app;

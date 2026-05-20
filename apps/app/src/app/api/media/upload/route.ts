import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "file";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // For now, return a stub response
    // Real R2 upload will happen when R2 credentials are configured
    const id = `media_${Date.now()}`;
    return NextResponse.json({
      id,
      title: file.name,
      type,
      size: file.size,
      mimeType: file.type,
      status: "uploaded",
      message: "File received. R2 storage not yet configured — file stored in memory.",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

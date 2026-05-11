import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";
import { nango } from "@/lib/nango";

export async function POST(req: NextRequest) {
    const userId = await resolveUserId();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const token = await nango.createConnectSession(userId);
        return NextResponse.json({ token });
    } catch (error: any) {
        console.error("Nango session creation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

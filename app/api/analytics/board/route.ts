import { NextResponse, NextRequest } from "next/server";
import { getBoardAnalytics } from "@/lib/actions/analytics";

export async function GET(request: NextRequest) {
    try {
        const boardId = request.nextUrl.searchParams.get("boardId");
        if (!boardId) return NextResponse.json({ error: "Missing boardId" }, { status: 400 });

        const result = await getBoardAnalytics(boardId);
        return NextResponse.json(result);
    } catch (err) {
        console.error("/api/analytics/board error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

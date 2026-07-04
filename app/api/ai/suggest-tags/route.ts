import { NextResponse } from "next/server";
import { suggestTagsForJob } from "@/lib/actions/ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { company, position, description } = body;
        const result = await suggestTagsForJob({ company, position, description });
        if (result?.error) return NextResponse.json({ error: result.error }, { status: 403 });
        return NextResponse.json(result);
    } catch (err) {
        console.error("/api/ai/suggest-tags error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

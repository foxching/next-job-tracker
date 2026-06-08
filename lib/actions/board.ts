"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board } from "../models";

export async function updateBoardName(boardId: string, name: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    if (!name || name.trim() === "") {
        return { error: "Board name cannot be empty" };
    }

    await connectDB();

    const board = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Board not found" };
    }

    try {
        await Board.findByIdAndUpdate(boardId, {
            name: name.trim(),
        });

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error updating board name:", error);
        return { error: "Failed to update board name" };
    }
}

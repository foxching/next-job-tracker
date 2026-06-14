"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board } from "../models";


export async function createBoard(name: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    if (!name || name.trim() === "") {
        return { error: "Board name cannot be empty" };
    }

    await connectDB();

    // Optional: check for duplicate board names
    const existingBoard = await Board.findOne({
        name: name.trim(),
        userId: session.user.id,
    });

    if (existingBoard) {
        return { error: "A board with this name already exists" };
    }

    const newBoard = new Board({
        name: name.trim(),
        userId: session.user.id,
        columns: [],
        isActive: false,
    });

    await newBoard.save();

    revalidatePath("/dashboard");

    return {
        success: true,
    };
}

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

export async function setActiveBoard(boardId: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    await connectDB();

    // Verify ownership
    const board = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Board not found or unauthorized" };
    }

    // Deactivate all boards belonging to the user
    await Board.updateMany(
        {
            userId: session.user.id,
        },
        {
            isActive: false,
        }
    );

    // Activate selected board
    await Board.findByIdAndUpdate(boardId, {
        isActive: true,
    });

    revalidatePath("/dashboard");

    return { success: true };
}
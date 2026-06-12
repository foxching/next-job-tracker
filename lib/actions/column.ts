"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

export async function createColumn(boardId: string, name: string, icon: string, color: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    await connectDB();

    // Verify board ownership
    const board = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Board not found or unauthorized" };
    }

    // Get the next order number
    const columnCount = board.columns?.length || 0;

    // Create new column
    const newColumn = new Column({
        name,
        boardId,
        order: columnCount,
        icon,
        color,
        jobApplications: [],
    });

    await newColumn.save();

    // Add column to board
    await Board.findByIdAndUpdate(boardId, {
        $push: { columns: newColumn._id },
    });

    revalidatePath("/dashboard");

    return { success: true };
}

export async function deleteColumn(columnId: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    await connectDB();

    const column = await Column.findById(columnId);

    if (!column) {
        return { error: "Column not found" };
    }

    // Verify ownership through board
    const board = await Board.findOne({
        _id: column.boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Unauthorized" };
    }

    // Optional: prevent deleting default columns
    // if (column.isDefault) {
    //     return { error: "Default columns cannot be deleted" };
    // }

    // Delete all job applications in column
    await JobApplication.deleteMany({
        columnId: columnId,
    });

    // Remove column reference from board
    await Board.findByIdAndUpdate(column.boardId, {
        $pull: { columns: columnId },
    });

    // Delete column itself
    await Column.deleteOne({
        _id: columnId,
    });

    revalidatePath("/dashboard");

    return { success: true };
}
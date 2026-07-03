"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

type ColumnNameUpdate = {
    columnId: string;
    name: string;
};

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

    return { success: true, column: JSON.parse(JSON.stringify(newColumn)) };
}

export async function updateColumn(columnId: string, name: string, icon: string, color: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    if (!name || name.trim() === "") {
        return { error: "Column name cannot be empty" };
    }

    await connectDB();

    const column = await Column.findById(columnId);

    if (!column) {
        return { error: "Column not found" };
    }

    const board = await Board.findOne({
        _id: column.boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Unauthorized" };
    }

    const updatedColumn = await Column.findByIdAndUpdate(
        columnId,
        {
            name: name.trim(),
            icon,
            color,
        },
        { new: true }
    ).populate("jobApplications");

    revalidatePath("/dashboard");

    return { success: true, column: JSON.parse(JSON.stringify(updatedColumn)) };
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

    return { success: true, columnId };
}

export async function bulkUpdateColumnNames(updates: ColumnNameUpdate[]) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    if (!updates || updates.length === 0) {
        return { error: "No column updates provided" };
    }

    // validate every name before writing anything
    for (const { name } of updates) {
        if (!name || name.trim() === "") {
            return { error: "Column name cannot be empty" };
        }
    }

    await connectDB();

    try {
        // bulkWrite issues one round trip instead of N separate updateOne calls
        const result = await Column.bulkWrite(
            updates.map(({ columnId, name }) => ({
                updateOne: {
                    filter: { _id: columnId },
                    update: { $set: { name: name.trim() } },
                },
            }))
        );
        if (result.matchedCount !== updates.length) {
            // some columnIds didn't belong to this user or didn't exist —
            // partial success; surface it rather than pretending all succeeded
            return {
                error: "Some columns could not be updated",
                matched: result.matchedCount,
                expected: updates.length,
            };
        }

        revalidatePath("/dashboard");

        return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
        console.error("Error bulk updating column names:", error);
        return { error: "Failed to update column names" };
    }
}
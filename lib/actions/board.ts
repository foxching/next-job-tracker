"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board } from "../models";

type UpdateBoardDetailsInput = {
    name: string;
    description?: string;
    themeColor?: string;
};

type UpdateCardDisplayInput = {
    showSalary: boolean;
    showAppliedDate: boolean;
    showTags: boolean;
};

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

export async function updateBoardDetails(
    boardId: string,
    { name, description, themeColor }: UpdateBoardDetailsInput
) {
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
        const updatedBoard = await Board.findByIdAndUpdate(
            boardId,
            {
                name: name.trim(),
                description: description?.trim() ?? "",
                themeColor,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        console.log(updatedBoard);


        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error updating board details:", error);
        return { error: "Failed to update board details" };
    }
}

export async function updateCardDisplaySettings(
    boardId: string,
    { showSalary, showAppliedDate, showTags }: UpdateCardDisplayInput
) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    const board = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Board not found" };
    }

    await connectDB();

    try {
        const updatedBoard = await Board.findOneAndUpdate(
            { _id: boardId, userId: session.user.id },
            {
                "settings.cardDisplay.showSalary": showSalary,
                "settings.cardDisplay.showAppliedDate": showAppliedDate,
                "settings.cardDisplay.showTags": showTags,
            },
            { new: true }
        ).lean();

        if (!updatedBoard) {
            return { error: "Board not found" };
        }

        revalidatePath("/dashboard");

        const plainBoard = JSON.parse(JSON.stringify(updatedBoard));

        return { success: true, board: plainBoard };
    } catch (error) {
        console.error("Error updating card display settings:", error);
        return { error: "Failed to update card display settings" };
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
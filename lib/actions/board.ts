"use server"

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import { ExportBoardError, ExportBoardResult, ExportedBoard, ExportedJob, ExportedColumn, SortField, DuplicateBoardResult, DuplicateBoardError } from "../models/models.types";
import { SortDirection } from "mongodb";
import mongoose from "mongoose";

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

type SortSettingsInput = {
    field: SortField;
    direction: SortDirection;
};

const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
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

export async function updateSortSettings(
    boardId: string,
    { field, direction }: SortSettingsInput
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
                "settings.sorting.field": field,
                "settings.sorting.direction": direction,
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
        console.error("Error updating sort settings:", error);
        return { error: "Failed to update srot settings" };
    }
}

export async function setSortFieldManual(boardId: string) {
    const session = await getSession();

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    await connectDB();

    try {
        const updatedBoard = await Board.findOneAndUpdate(
            { _id: boardId, userId: session.user.id },
            { "settings.sorting.field": "manual" },
            { new: true }
        ).lean();

        if (!updatedBoard) {
            return { error: "Board not found" };
        }

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error switching board to manual sort:", error);
        return { error: "Failed to switch to manual sort" };
    }
}

export async function exportBoardAction(
    boardId: string
): Promise<ExportBoardResult | ExportBoardError> {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }


        await connectDB();

        const board = await Board.findOne({
            _id: boardId,
            userId: session.user.id,
        });

        if (!board) {
            return { success: false, error: "Board not found" };
        }

        const columns = await Column.find({ boardId }).sort({ order: 1 }).lean();

        const columnIds = columns.map((col) => col._id);
        const jobs = await JobApplication.find({ columnId: { $in: columnIds } }).lean();

        const jobsByColumn = jobs.reduce<Record<string, ExportedJob[]>>((acc, job) => {
            const colId = job.columnId.toString();
            if (!acc[colId]) acc[colId] = [];
            acc[colId].push({
                id: job._id.toString(),
                company: job.company,
                position: job.position ?? "",
                location: job.location,
                salary: job.salary,
                jobUrl: job.jobUrl,
                appliedDate: job.appliedDate,
                tags: job.tags ?? [],
                notes: job.notes,
                createdAt: formatDate(job.createdAt),
                updatedAt: formatDate(job.updatedAt),
            });
            return acc;
        }, {});

        const exportedColumns: ExportedColumn[] = columns.map((col) => ({
            id: col._id.toString(),
            name: col.name,
            order: col.order,
            jobApplications: jobsByColumn[col._id.toString()] ?? [],
        }));

        const exportedBoard: ExportedBoard = {
            id: board._id.toString(),
            name: board.name,
            description: board.description,
            exportedAt: new Date().toISOString(),
            columns: exportedColumns,
        };

        const slug = board.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const date = new Date().toISOString().slice(0, 10);
        const filename = `${slug}-${date}.json`;

        return { success: true, data: exportedBoard, filename };
    } catch (err) {
        console.error("[exportBoardAction]", err);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function duplicateBoardAction(
    boardId: string
): Promise<DuplicateBoardResult | DuplicateBoardError> {

    const session = await getSession();

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    await connectDB();

    //Fetch source board 
    const sourceBoard = await Board.findOne({
        _id: boardId,
        userId: session.user.id,
    }).lean();

    if (!sourceBoard) {
        return { success: false, error: "Board not found." };
    }

    //Fetch source columns + jobs
    const sourceColumns = await Column.find({ boardId }).sort({ order: 1 }).lean();
    const sourceColumnIds = sourceColumns.map((col) => col._id);
    const sourceJobs = await JobApplication.find({ columnId: { $in: sourceColumnIds } }).lean();

    // Group jobs by their source columnId for easy lookup
    const jobsByColumn = sourceJobs.reduce<Record<string, typeof sourceJobs>>(
        (acc, job) => {
            const key = job.columnId.toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(job);
            return acc;
        },
        {}
    );

    //Create new board
    const newBoardId = new mongoose.Types.ObjectId();
    const clonedBoardName = `${sourceBoard.name} (clone)`;

    type NewColumn = {
        doc: object;
        newColId: mongoose.Types.ObjectId;
        newJobs: object[];
    };

    const newColumns: NewColumn[] = sourceColumns.map((col) => {
        const newColId = new mongoose.Types.ObjectId();
        const colJobs = jobsByColumn[col._id.toString()] ?? [];
        const newJobIds = colJobs.map(() => new mongoose.Types.ObjectId());

        const newJobs = colJobs.map((job, i) => ({
            ...job,
            _id: newJobIds[i],
            columnId: newColId,
            boardId: newBoardId,
            userId: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        return {
            newColId,
            doc: {
                ...col,
                _id: newColId,
                boardId: newBoardId,
                jobApplications: newJobIds,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            newJobs,
        };
    });

    //Write everything inside a transaction
    const mongoSession = await mongoose.startSession();
    try {
        mongoSession.startTransaction();

        await Board.create(
            [
                {
                    ...sourceBoard,
                    _id: newBoardId,
                    name: clonedBoardName,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { session: mongoSession }
        );

        for (const { doc, newJobs } of newColumns) {
            await Column.create([doc], { session: mongoSession });

            if (newJobs.length > 0) {
                await JobApplication.insertMany(newJobs, { session: mongoSession });
            }
        }

        await mongoSession.commitTransaction();

        revalidatePath("/dashboard");

        return {
            success: true,
            boardId: newBoardId.toString(),
            boardName: clonedBoardName,
        };
    } catch (err) {
        await mongoSession.abortTransaction();
        console.error("[duplicateBoardAction]", err);
        return { success: false, error: "Something went wrong. Please try again." };
    } finally {
        mongoSession.endSession();
    }

}




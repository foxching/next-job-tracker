"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "../actions/job-application";
import { setSortFieldManual } from "@/lib/actions/board";
import { toast } from "sonner";

export function useBoard(initialBoard?: Board | null) {
    const [board, setBoard] = useState<Board | null>(initialBoard || null);
    const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard);
            setColumns(initialBoard.columns || []);
        }
    }, [initialBoard]);

    async function moveJob(
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ) {
        setColumns((prev) => {
            const newColumns = prev.map((col) => ({
                ...col,
                jobApplications: [...col.jobApplications],
            }));

            // Find and remove job from the old column

            let jobToMove: JobApplication | null = null;
            let oldColumnId: string | null = null;

            for (const col of newColumns) {
                const jobIndex = col.jobApplications.findIndex(
                    (j) => j._id === jobApplicationId
                );
                if (jobIndex !== -1 && jobIndex !== undefined) {
                    jobToMove = col.jobApplications[jobIndex];
                    oldColumnId = col._id;
                    col.jobApplications = col.jobApplications.filter(
                        (job) => job._id !== jobApplicationId
                    );
                    break;
                }
            }

            if (jobToMove && oldColumnId) {
                const targetColumnIndex = newColumns.findIndex(
                    (col) => col._id === newColumnId
                );
                if (targetColumnIndex !== -1) {
                    const targetColumn = newColumns[targetColumnIndex];
                    const currentJobs = targetColumn.jobApplications || [];

                    const updatedJobs = [...currentJobs];
                    updatedJobs.splice(newOrder, 0, {
                        ...jobToMove,
                        columnId: newColumnId,
                        order: newOrder * 100,
                    });

                    const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
                        ...job,
                        order: idx * 100,
                    }));

                    newColumns[targetColumnIndex] = {
                        ...targetColumn,
                        jobApplications: jobsWithUpdatedOrders,
                    };
                }
            }

            return newColumns;
        });

        try {
            const result = await updateJobApplication(jobApplicationId, {
                columnId: newColumnId,
                order: newOrder,
            });
            if (board) {
                const currentSortField = board?.settings?.sorting?.field ?? "createdAt";
                if (currentSortField !== "manual") {
                    const result = await setSortFieldManual(board._id);
                    if (!result?.error) {
                        toast.info(
                            "Switched to manual ordering since you moved a card.",
                            {
                                description:
                                    "Change this anytime in Board Settings → Sorting.",
                            }
                        );
                        // optimistically update local board state so the Sorting tab
                        // reflects "Manual" immediately if settings dialog is reopened
                        // without a full page reload — adjust to however you manage
                        // board state (useState, SWR mutate, React Query setQueryData, etc.)
                    }
                }
            }

        } catch (err) {
            console.error("Error", err);
        }
    }

    return { board, columns, error, moveJob };
}
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import { setSortFieldManual } from "@/lib/actions/board";
import { updateJobApplication } from "@/lib/actions/job-application";
import { Board, Column, JobApplication } from "@/lib/models/models.types";

type BoardContextValue = {
    board: Board;
    columns: Column[];
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
    addColumn: (column: Column) => void;
    updateColumn: (column: Column) => void;
    removeColumn: (columnId: string) => void;
    addJob: (job: JobApplication) => void;
    updateJob: (job: JobApplication) => void;
    removeJob: (jobId: string) => void;
    moveJob: (
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ) => Promise<void>;
    patchBoard: (updates: Partial<Board>) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

function reorderColumns(
    columns: Column[],
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number
) {
    const nextColumns = columns.map((col) => ({
        ...col,
        jobApplications: [...(col.jobApplications || [])],
    }));

    let jobToMove: JobApplication | null = null;

    for (const col of nextColumns) {
        const jobIndex = col.jobApplications.findIndex(
            (job) => job._id === jobApplicationId
        );

        if (jobIndex !== -1) {
            jobToMove = col.jobApplications[jobIndex];
            col.jobApplications.splice(jobIndex, 1);
            break;
        }
    }

    if (!jobToMove) {
        return columns;
    }

    const targetColumnIndex = nextColumns.findIndex(
        (col) => col._id === newColumnId
    );

    if (targetColumnIndex === -1) {
        return columns;
    }

    const targetColumn = nextColumns[targetColumnIndex];
    const targetJobs = [...(targetColumn.jobApplications || [])];

    targetJobs.splice(newOrder, 0, {
        ...jobToMove,
        columnId: newColumnId,
    });

    nextColumns[targetColumnIndex] = {
        ...targetColumn,
        jobApplications: targetJobs.map((job, index) => ({
            ...job,
            order: index * 100,
        })),
    };

    return nextColumns;
}

export function BoardProvider({
    initialBoard,
    children,
}: {
    initialBoard: Board;
    children: React.ReactNode;
}) {
    const [board, setBoard] = useState<Board>(initialBoard);
    const [columns, setColumns] = useState<Column[]>(initialBoard.columns || []);
    const boardWithColumns = useMemo(
        () => ({
            ...board,
            columns,
        }),
        [board, columns]
    );
    const columnsRef = useRef(columns);
    const boardRef = useRef(boardWithColumns);

    useEffect(() => {
        columnsRef.current = columns;
    }, [columns]);

    useEffect(() => {
        boardRef.current = boardWithColumns;
    }, [boardWithColumns]);

    const patchBoard = useCallback((updates: Partial<Board>) => {
        setBoard((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const addColumn = useCallback((column: Column) => {
        setColumns((prev) => [...prev, column]);
        setBoard((prev) => ({
            ...prev,
            columns: [...prev.columns, column],
        }));
    }, []);

    const updateColumn = useCallback((column: Column) => {
        setColumns((prev) =>
            prev.map((current) => (current._id === column._id ? column : current))
        );
        setBoard((prev) => ({
            ...prev,
            columns: prev.columns.map((current) =>
                current._id === column._id ? column : current
            ),
        }));
    }, []);

    const removeColumn = useCallback((columnId: string) => {
        setColumns((prev) => prev.filter((column) => column._id !== columnId));
        setBoard((prev) => ({
            ...prev,
            columns: prev.columns.filter((column) => column._id !== columnId),
        }));
    }, []);

    const addJob = useCallback((job: JobApplication) => {
        setColumns((prev) =>
            prev.map((column) =>
                column._id === job.columnId
                    ? {
                        ...column,
                        jobApplications: [...(column.jobApplications || []), job],
                    }
                    : column
            )
        );
    }, []);

    const updateJob = useCallback((job: JobApplication) => {
        setColumns((prev) => {
            const withoutJob = prev.map((column) => ({
                ...column,
                jobApplications: (column.jobApplications || []).filter(
                    (current) => current._id !== job._id
                ),
            }));

            return withoutJob.map((column) =>
                column._id === job.columnId
                    ? {
                        ...column,
                        jobApplications: [...(column.jobApplications || []), job],
                    }
                    : column
            );
        });
    }, []);

    const removeJob = useCallback((jobId: string) => {
        setColumns((prev) =>
            prev.map((column) => ({
                ...column,
                jobApplications: (column.jobApplications || []).filter(
                    (job) => job._id !== jobId
                ),
            }))
        );
    }, []);

    const moveJob = useCallback(
        async (jobApplicationId: string, newColumnId: string, newOrder: number) => {
            const previousColumns = columnsRef.current;
            const previousBoard = boardRef.current;
            const currentSortField =
                previousBoard.settings?.sorting?.field ?? "createdAt";

            setColumns((prev) =>
                reorderColumns(prev, jobApplicationId, newColumnId, newOrder)
            );

            if (currentSortField !== "manual") {
                setBoard((prev) => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        sorting: {
                            field: "manual",
                            direction: prev.settings?.sorting?.direction ?? "desc",
                        },
                    },
                }));
            }

            try {
                const result = await updateJobApplication(jobApplicationId, {
                    columnId: newColumnId,
                    order: newOrder,
                });

                if (result.error) {
                    setColumns(previousColumns);
                    setBoard(previousBoard);
                    toast.error("Failed to move the job application.");
                    return;
                }

                if (currentSortField !== "manual") {
                    const sortResult = await setSortFieldManual(previousBoard._id);
                    if (sortResult?.error) {
                        toast.error("Moved card, but failed to update sorting.");
                        return;
                    }

                    toast.info("Switched to manual ordering since you moved a card.", {
                        description: "Change this anytime in Board Settings -> Sorting.",
                    });
                }
            } catch (err) {
                console.error("Error moving job", err);
                setColumns(previousColumns);
                setBoard(previousBoard);
                toast.error("Failed to move the job application.");
            }
        },
        []
    );

    const value = useMemo(
        () => ({
            board: boardWithColumns,
            columns,
            setBoard,
            setColumns,
            addColumn,
            updateColumn,
            removeColumn,
            addJob,
            updateJob,
            removeJob,
            moveJob,
            patchBoard,
        }),
        [
            addColumn,
            addJob,
            boardWithColumns,
            columns,
            moveJob,
            patchBoard,
            removeColumn,
            removeJob,
            updateColumn,
            updateJob,
        ]
    );

    return (
        <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
    );
}

export function useBoardContext() {
    const context = useContext(BoardContext);

    if (!context) {
        throw new Error("useBoardContext must be used inside BoardProvider");
    }

    return context;
}

"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Edit2, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import CreateColumnDialog from "./create-column-dialog";
import JobApplicationCard from "./job-application-card";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";
import { deleteColumn } from "@/lib/actions/column";
import { toast } from "sonner";

interface KanbanBoardProps {
    board: Board;
}
interface ColConfig {
    color: string;
    icon: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    Calendar: <Calendar className="h-4 w-4" />,
    CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
    Mic: <Mic className="h-4 w-4" />,
    Award: <Award className="h-4 w-4" />,
    XCircle: <XCircle className="h-4 w-4" />,
};

const DEFAULT_COLUMN_CONFIG: ColConfig = {
    color: "bg-cyan-500",
    icon: <Calendar className="h-4 w-4" />,
};

function DroppableColumn({ column, config, boardId, sortedColumns }: { column: Column, config: ColConfig, boardId: string, sortedColumns: Column[] }) {
    const [showEditColumnDialog, setShowEditColumnDialog] = useState(false);
    const sortedJobs =
        column.jobApplications?.sort((a, b) => a.order - b.order) || [];

    const { setNodeRef, isOver } = useDroppable({
        id: column._id,
        data: {
            type: "column",
            columnId: column._id,
        },
    });

    async function handleDelete() {
        if (sortedJobs.length > 0) {
            toast.error("Cannot delete a column that still has job applications.");
            return;
        }
        try {
            const result = await deleteColumn(column._id);

            if (result.error) {
                toast.error("Failed to delete column.");
            } else {
                toast.success("Column deleted successfully.");
            }
        } catch {
            toast.error("An error occurred while deleting the column.");
        }
    }



    return (
        <Card className="min-w-[280px] flex-shrink-0 shadow-md p-0 flex flex-col h-full">
            <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3 relative`}>
                <div className=" flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {config.icon}
                        <CardTitle className="text-white text-base font-semibold">{column.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowEditColumnDialog(true)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <div className={`flex-1 flex flex-col gap-2 min-h-0 bg-muted/20 rounded-b-lg overflow-hidden ${isOver ? "ring-2 ring-blue-500" : ""}`}>
                <CardContent ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 pt-2 pb-2">
                    <SortableContext
                        items={sortedJobs.map((job) => job._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sortedJobs.map((job) => (
                            <SortableJobCard
                                key={job._id}
                                job={{ ...job, columnId: job.columnId || column._id }}
                                columns={sortedColumns}
                            />
                        ))}
                    </SortableContext>
                </CardContent>
                <div className="border-t border-border p-2 bg-muted/10">
                    <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
                </div>
            </div>
            {showEditColumnDialog && (
                <CreateColumnDialog
                    boardId={boardId}
                    open={showEditColumnDialog}
                    onOpenChange={setShowEditColumnDialog}
                    column={column}
                />
            )}
        </Card>
    );
}

function SortableJobCard({ job, columns }: { job: JobApplication, columns: Column[] }) {
    const {
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
        setNodeRef,
    } = useSortable({
        id: job._id,
        data: {
            type: "job",
            job,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div ref={setNodeRef} style={style}>
            <JobApplicationCard job={job} columns={columns} dragHandleProps={{ ...attributes, ...listeners }} />
        </div>
    )
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const { columns, moveJob } = useBoard(board);
    const sortedColumns = columns?.sort((a, b) => a.order - b.order) || [];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    async function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        setActiveId(null);

        if (!over || !board._id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        let draggedJob: JobApplication | null = null;
        let sourceColumn: Column | null = null;
        let sourceIndex = -1;

        for (const column of sortedColumns) {
            const jobs =
                column.jobApplications.sort((a, b) => a.order - b.order) || [];
            const jobIndex = jobs.findIndex((j) => j._id === activeId);
            if (jobIndex !== -1) {
                draggedJob = jobs[jobIndex];
                sourceColumn = column;
                sourceIndex = jobIndex;
                break;
            }
        }

        if (!draggedJob || !sourceColumn) return;

        // Check if dropped in a column or another job
        const targetColumn = sortedColumns.find((col) => col._id === overId);
        const targetJob = sortedColumns
            .flatMap((col) => col.jobApplications || [])
            .find((job) => job._id === overId);

        let targetColumnId: string;
        let newOrder: number;

        if (targetColumn) {
            targetColumnId = targetColumn._id;
            const jobsInTarget =
                targetColumn.jobApplications
                    .filter((j) => j._id !== activeId)
                    .sort((a, b) => a.order - b.order) || [];
            newOrder = jobsInTarget.length;
        } else if (targetJob) {
            const targetJobColumn = sortedColumns.find((col) =>
                col.jobApplications.some((j) => j._id === targetJob._id)
            );
            targetColumnId = targetJob.columnId || targetJobColumn?._id || "";
            if (!targetColumnId) return;

            const targetColumnObj = sortedColumns.find(
                (col) => col._id === targetColumnId
            );

            if (!targetColumnObj) return;

            const allJobsInTargetOriginal =
                targetColumnObj.jobApplications.sort((a, b) => a.order - b.order) || [];

            const allJobsInTargetFiltered =
                allJobsInTargetOriginal.filter((j) => j._id !== activeId) || [];

            const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
                (j) => j._id === overId
            );

            const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
                (j) => j._id === overId
            );

            if (targetIndexInFiltered !== -1) {
                if (sourceColumn._id === targetColumnId) {
                    if (sourceIndex < targetIndexInOriginal) {
                        newOrder = targetIndexInFiltered + 1;
                    } else {
                        newOrder = targetIndexInFiltered;
                    }
                } else {
                    newOrder = targetIndexInFiltered;
                }
            } else {
                newOrder = allJobsInTargetFiltered.length;
            }
        } else {
            return;
        }

        if (!targetColumnId) {
            return;
        }

        await moveJob(activeId, targetColumnId, newOrder);
    }
    const activeJob = sortedColumns
        .flatMap((col) => col.jobApplications || [])
        .find((job) => job._id === activeId);
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4 w-full h-full">
                {sortedColumns.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 p-2 w-full items-start h-full">
                        {sortedColumns.map((col) => {
                            const config: ColConfig = {
                                color: col.color || DEFAULT_COLUMN_CONFIG.color,
                                icon:
                                    ICON_MAP[col.icon || "Calendar"] ||
                                    DEFAULT_COLUMN_CONFIG.icon,
                            };

                            return (
                                <DroppableColumn
                                    key={col._id}
                                    column={col}
                                    config={config}
                                    boardId={board._id}
                                    sortedColumns={sortedColumns}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full py-20 text-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                No columns found
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Create your first column to start organizing your job applications.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <DragOverlay>
                {activeJob ? (
                    <div className="opacity-50">
                        <JobApplicationCard job={activeJob} columns={sortedColumns} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>

    )
}
"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { Edit2, MoreVertical, Trash2, ArrowUpDown, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import CreateColumnDialog from "./create-column-dialog";
import JobApplicationCard from "./job-application-card";
import { useMemo, useState } from "react";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteColumn } from "@/lib/actions/column";
import { toast } from "sonner";
import { useBoardContext } from "./board-provider";

type CardDisplaySettings =
    NonNullable<NonNullable<Board["settings"]>["cardDisplay"]>;
type SortingSettings = NonNullable<NonNullable<Board["settings"]>["sorting"]>;
type BoardFilters = {
    query: string;
    selectedColumns: string[];
    selectedTags: string[];
    hasSalary: "all" | "with-salary" | "without-salary";
    hasNotes: "all" | "with-notes" | "without-notes";
};

// human-readable labels for sorting
const SORT_FIELD_LABELS: Record<Exclude<SortingSettings["field"], "manual">, string> = {
    createdAt: "Date added",
    company: "Company",
    position: "Position",
};

function sortJobs(jobs: JobApplication[], sorting: SortingSettings) {
    const sorted = [...jobs];
    if (sorting?.field === "manual") return sorted.sort((a, b) => a.order - b.order);
    const dir = sorting?.direction === "asc" ? 1 : -1;
    if (sorting?.field === "createdAt") {
        return sorted.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir);
    }
    if (sorting?.field === "company") return sorted.sort((a, b) => a.company.localeCompare(b.company) * dir);
    if (sorting?.field === "position") return sorted.sort((a, b) => a.position.localeCompare(b.position) * dir);
    return sorted;
}

function matchesFilters(job: JobApplication, filters?: BoardFilters) {
    if (!filters) return true;
    const q = (filters.query || "").toLowerCase().trim();
    if (q) {
        const hay = `${job.company} ${job.position} ${(job.notes || "")} ${(job.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
    }
    if (filters.selectedColumns && filters.selectedColumns.length > 0) {
        if (!job.columnId || !filters.selectedColumns.includes(job.columnId)) return false;
    }
    if (filters.selectedTags && filters.selectedTags.length > 0) {
        const tags = job.tags || [];
        const hasAny = filters.selectedTags.some((tag) => tags.includes(tag));
        if (!hasAny) return false;
    }
    if (filters.hasSalary === "with-salary" && !job.salary) return false;
    if (filters.hasSalary === "without-salary" && job.salary) return false;
    if (filters.hasNotes === "with-notes" && !(job.notes && job.notes.trim())) return false;
    if (filters.hasNotes === "without-notes" && (job.notes && job.notes.trim())) return false;
    return true;
}

function DroppableColumn({ column, boardId, sortedColumns, cardDisplay, filters, sorting }: { column: Column, boardId: string, sortedColumns: Column[], cardDisplay: CardDisplaySettings, filters?: BoardFilters, sorting: SortingSettings }) {
    const { removeColumn } = useBoardContext();
    const [showEditColumnDialog, setShowEditColumnDialog] = useState(false);
    const jobs = column.jobApplications || [];
    const { setNodeRef, isOver } = useDroppable({ id: column._id, data: { type: "column", columnId: column._id } });

    async function handleDelete() {
        if (jobs.length > 0) {
            toast.error("Cannot delete a column that still has job applications.");
            return;
        }
        try {
            const result = await deleteColumn(column._id);
            if (result.error) {
                toast.error("Failed to delete column.");
            } else {
                removeColumn(column._id);
                toast.success("Column deleted successfully.");
            }
        } catch {
            toast.error("An error occurred while deleting the column.");
        }
    }

    return (
        <Card className="kanban-column h-full min-h-0 p-0 flex flex-col">
            <CardHeader
                className="kanban-column-header rounded-t-xl px-3 pb-2.5 pt-3"
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <CardTitle className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{column.name}</CardTitle>
                        <span className="rounded-full border border-white/40 px-2 py-0.5 text-[11px] font-medium tabular-nums tracking-wide text-white">
                            {jobs.length}
                        </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                        <CreateJobApplicationDialog
                            columnId={column._id}
                            boardId={boardId}
                            iconOnly
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/15 hover:text-white">
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
                </div>
            </CardHeader>
            <div className={`kanban-column-content flex flex-col flex-1 min-h-0 rounded-b-xl overflow-hidden ${isOver ? "ring-2 ring-primary/60" : ""}`}>
                <CardContent ref={setNodeRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 px-2.5 py-2.5">
                    <SortableContext items={jobs.map((j) => j._id)} strategy={verticalListSortingStrategy}>
                        {sortJobs(jobs.filter((j) => matchesFilters(j, filters)), sorting).map((job) => (
                            <SortableJobCard key={job._id} job={{ ...job, columnId: job.columnId || column._id }} columns={sortedColumns} cardDisplay={cardDisplay} />
                        ))}
                    </SortableContext>
                </CardContent>
            </div>
            {showEditColumnDialog && (
                <CreateColumnDialog boardId={boardId} column={column} open={showEditColumnDialog} onOpenChange={setShowEditColumnDialog} />
            )}
        </Card>
    );
}

function SortableJobCard({ job, columns, cardDisplay }: { job: JobApplication, columns: Column[], cardDisplay: CardDisplaySettings }) {
    const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({ id: job._id, data: { type: "job", job } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style}>
            <JobApplicationCard job={job} columns={columns} dragHandleProps={{ ...attributes, ...listeners }} cardDisplay={cardDisplay} />
        </div>
    );
}

export default function KanbanBoard({ externalFilters }: { externalFilters?: BoardFilters }) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
    const { board, columns, moveJob } = useBoardContext();
    const sortedColumns = useMemo(() => [...(columns || [])].sort((a, b) => a.order - b.order), [columns]);

    const cardDisplay: CardDisplaySettings = {
        showSalary: board?.settings?.cardDisplay?.showSalary ?? true,
        showAppliedDate: board?.settings?.cardDisplay?.showAppliedDate ?? false,
        showTags: board?.settings?.cardDisplay?.showTags ?? true,
    };

    const sorting: SortingSettings = {
        field: board?.settings?.sorting?.field ?? "createdAt",
        direction: board?.settings?.sorting?.direction ?? "desc",
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    async function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        if (!over || !board?._id) return;
        const activeId = active.id as string;
        const overId = over.id as string;

        let draggedJob: JobApplication | null = null;
        let sourceColumn: Column | null = null;
        let sourceIndex = -1;

        for (const column of sortedColumns) {
            const jobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order);
            const jobIndex = jobs.findIndex((j) => j._id === activeId);
            if (jobIndex !== -1) {
                draggedJob = jobs[jobIndex];
                sourceColumn = column;
                sourceIndex = jobIndex;
                break;
            }
        }

        if (!draggedJob || !sourceColumn) return;

        const targetColumn = sortedColumns.find((col) => col._id === overId);
        const targetJob = sortedColumns.flatMap((col) => col.jobApplications || []).find((job) => job._id === overId);

        let targetColumnId: string | undefined;
        let newOrder: number | undefined;

        if (targetColumn) {
            targetColumnId = targetColumn._id;
            const jobsInTarget = (targetColumn.jobApplications || []).filter((j) => j._id !== activeId).sort((a, b) => a.order - b.order) || [];
            newOrder = jobsInTarget.length;
        } else if (targetJob) {
            const targetJobColumn = sortedColumns.find((col) => (col.jobApplications || []).some((j) => j._id === targetJob._id));
            targetColumnId = targetJob.columnId || targetJobColumn?._id;
            if (!targetColumnId) return;
            const targetColumnObj = sortedColumns.find((col) => col._id === targetColumnId);
            if (!targetColumnObj) return;
            const allJobsInTargetOriginal = [...(targetColumnObj.jobApplications || [])].sort((a, b) => a.order - b.order);
            const allJobsInTargetFiltered = allJobsInTargetOriginal.filter((j) => j._id !== activeId) || [];
            const targetIndexInOriginal = allJobsInTargetOriginal.findIndex((j) => j._id === overId);
            const targetIndexInFiltered = allJobsInTargetFiltered.findIndex((j) => j._id === overId);
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

        if (!targetColumnId || newOrder === undefined) return;

        await moveJob(activeId, targetColumnId, newOrder);
    }

    const activeJob = sortedColumns.flatMap((col) => col.jobApplications || []).find((job) => job._id === activeId);

    return (
        <DndContext id="kanban-board-dnd" sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-4 w-full h-full min-h-0 overflow-hidden">
                {sortedColumns.length > 0 && sorting.field !== "manual" && (
                    <div className="flex items-center gap-1.5 px-2 text-sm text-muted-foreground shrink-0">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span className="text-xs">Sorted by <span className="text-xs text-foreground">{SORT_FIELD_LABELS[sorting.field as Exclude<SortingSettings["field"], "manual">]}</span>{sorting.direction === "asc" ? " (A–Z)" : ""}</span>
                    </div>
                )}

                {sortedColumns.length > 0 ? (
                    <div className="kanban-columns flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-3 w-full">
                        {sortedColumns.map((col) => {
                            return <DroppableColumn key={col._id} column={col} boardId={board?._id ?? ""} sortedColumns={sortedColumns} cardDisplay={cardDisplay} filters={externalFilters} sorting={sorting} />;
                        })}
                        <Button
                            type="button"
                            variant="ghost"
                            className="kanban-add-column h-10 w-full justify-center rounded-lg text-sm font-medium"
                            onClick={() => setShowAddColumnDialog(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add new list
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 flex items-center justify-center py-20 text-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No columns found</h2>
                            <p className="mt-2 text-sm text-gray-500">Create your first column to start organizing your job applications.</p>
                            <Button
                                type="button"
                                variant="ghost"
                                className="kanban-add-column mt-5 h-10 rounded-lg px-5 text-sm font-medium"
                                onClick={() => setShowAddColumnDialog(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Add new list
                            </Button>
                        </div>
                    </div>
                )}

                <DragOverlay>
                    {activeJob ? <div className="opacity-50"><JobApplicationCard job={activeJob} columns={sortedColumns} cardDisplay={cardDisplay} /></div> : null}
                </DragOverlay>
            </div>
            {showAddColumnDialog && board && (
                <CreateColumnDialog
                    boardId={board._id}
                    open={showAddColumnDialog}
                    onOpenChange={setShowAddColumnDialog}
                />
            )}
        </DndContext>
    );
}

"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Award, Banknote, BriefcaseBusiness, Building2, Calendar, CheckCircle2, Edit2, ExternalLink, FileText, GripVertical, MapPin, Mic, MoreVertical, Tags, Trash2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-application";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import JobApplicationForm, { JobApplicationFormData } from "./form/job-application-form";
import { useBoardContext } from "./board-provider";
import { FormProvider, useForm } from "react-hook-form";
import { RichTextDisplay } from "./rich-editor";

type CardDisplaySettings = {
    showSalary: boolean;
    showAppliedDate: boolean;
    showTags: boolean;
};

const TAG_COLORS = [
    { background: "#dbeafe", foreground: "#1d4ed8" },
    { background: "#dcfce7", foreground: "#15803d" },
    { background: "#fef3c7", foreground: "#b45309" },
    { background: "#fce7f3", foreground: "#be185d" },
    { background: "#ede9fe", foreground: "#6d28d9" },
    { background: "#cffafe", foreground: "#0e7490" },
    { background: "#ffedd5", foreground: "#c2410c" },
];

function getTagColor(tag: string) {
    const hash = Array.from(tag.toLowerCase()).reduce(
        (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
        0
    );
    return TAG_COLORS[hash % TAG_COLORS.length];
}

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
    cardDisplay: CardDisplaySettings;
    isDragOverlay?: boolean;
}

function formatAppliedDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function DetailField({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-muted/20 p-3">
            <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className="mt-1 break-words text-sm font-medium text-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function JobApplicationCard({ job, columns, dragHandleProps, cardDisplay, isDragOverlay = false }: JobApplicationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDescOpen, setIsDescOpen] = useState(false);
    const form = useForm<JobApplicationFormData>({
        defaultValues: {
            company: job.company,
            position: job.position,
            location: job.location || "",
            notes: job.notes || "",
            salary: job.salary || "",
            jobUrl: job.jobUrl || "",
            tags: job.tags?.join(", ") || "",
            appliedDate: job.appliedDate
                ? new Date(job.appliedDate).toISOString().split("T")[0]
                : "",
            description: job.description || "",
        },
    });
    const [showAllTags, setShowAllTags] = useState(false);
    const { updateJob, removeJob, moveJob } = useBoardContext();

    async function handleUpdate(formData: JobApplicationFormData) {
        try {
            const result = await updateJobApplication(job._id, {
                ...formData,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
            });

            if (result.error) {
                toast.error("Failed to update job application.");
                return;
            }

            if (result.data) {
                updateJob(result.data);
            }

            setIsEditing(false);
            toast.success("Job application updated successfully!");
        } catch {
            toast.error("Failed to update job application.");
        }
    }

    async function handleDelete() {
        try {
            const result = await deleteJobApplication(job._id);

            if (result.error) {
                toast.error("Failed to delete job application.");
                return;
            }

            removeJob(job._id);
            toast.success("Job application deleted successfully!");
        } catch {
            toast.error("An error occurred while deleting the job application.");
        }
    }
    async function handleMove(newColumnId: string) {
        const targetColumn = columns.find((column) => column._id === newColumnId);
        await moveJob(job._id, newColumnId, targetColumn?.jobApplications.length ?? 0);
    }

    const ICON_MAP: Record<string, React.ReactNode> = {
        Calendar: <Calendar className="h-4 w-4" />,
        CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
        Mic: <Mic className="h-4 w-4" />,
        Award: <Award className="h-4 w-4" />,
        XCircle: <XCircle className="h-4 w-4" />,
    };

    return (
        <>
            <Card
                className={`job-application-card relative w-full cursor-pointer transition-shadow hover:shadow-md group ${isDragOverlay ? "pointer-events-none scale-[1.02] cursor-grabbing shadow-2xl ring-2 ring-primary/60" : ""}`}
                {...dragHandleProps}
                onClick={isDragOverlay ? undefined : () => setIsDescOpen(true)}
            >
                {isDragOverlay && (
                    <span className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-primary text-primary-foreground shadow-md">
                        <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}
                <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 truncate text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">{job.position}</h3>
                            <p className="mb-2 truncate text-[13px] font-medium tracking-[-0.01em] text-muted-foreground">
                                {job.company}
                            </p>

                            <div className="flex flex-col gap-0.5 mb-1">
                                {cardDisplay.showSalary && job.salary && (
                                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                                        {job.salary}
                                    </span>
                                )}
                                {cardDisplay.showAppliedDate && job.appliedDate && (
                                    <span className="text-xs leading-relaxed text-muted-foreground">
                                        Applied {formatAppliedDate(job.appliedDate)}
                                    </span>
                                )}
                            </div>

                            {cardDisplay.showTags && job.tags && job.tags.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {(showAllTags ? job.tags : job.tags.slice(0, 2)).map((tag, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    backgroundColor: getTagColor(tag).background,
                                                    color: getTagColor(tag).foreground,
                                                }}
                                                className="
                                                    max-w-[100px]
                                                    px-2 py-1
                                                    text-[11px] font-medium tracking-[0.01em]
                                                    rounded-full
                                                    overflow-hidden
                                                    text-ellipsis
                                                    whitespace-nowrap
                                                "
                                                title={tag}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {job.tags.length > 2 && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="mt-2 h-auto p-0 text-xs font-medium text-blue-700 hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAllTags(!showAllTags);
                                            }}
                                        >
                                            {showAllTags
                                                ? "See less"
                                                : `See ${job.tags.length - 2} more`}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Move to</DropdownMenuLabel>
                                        {columns.length > 1 && (
                                            <>
                                                {columns
                                                    .filter((c) => c._id !== job.columnId)
                                                    .map((column, key) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMove(column._id);
                                                            }}
                                                        >
                                                            <div className="mr-2">
                                                                {ICON_MAP[column.icon as string] ?? null}
                                                            </div>
                                                            {column.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </>
                                        )}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete();
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
                <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="text-lg font-semibold">{job.position}</DialogTitle>
                        <DialogDescription>{job.company}</DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailField icon={<Building2 className="h-4 w-4" />} label="Company">
                                {job.company}
                            </DetailField>
                            <DetailField icon={<BriefcaseBusiness className="h-4 w-4" />} label="Position">
                                {job.position}
                            </DetailField>
                            {job.location && (
                                <DetailField icon={<MapPin className="h-4 w-4" />} label="Location">
                                    {job.location}
                                </DetailField>
                            )}
                            {job.salary && (
                                <DetailField icon={<Banknote className="h-4 w-4" />} label="Salary">
                                    {job.salary}
                                </DetailField>
                            )}
                            {job.appliedDate && (
                                <DetailField icon={<Calendar className="h-4 w-4" />} label="Applied date">
                                    {formatAppliedDate(job.appliedDate)}
                                </DetailField>
                            )}
                            {job.jobUrl && (
                                <DetailField icon={<ExternalLink className="h-4 w-4" />} label="Job posting">
                                    <a
                                        href={job.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        Open job posting
                                    </a>
                                </DetailField>
                            )}
                        </div>
                        {job.tags && job.tags.length > 0 && (
                            <section className="space-y-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <Tags className="h-4 w-4 text-muted-foreground" />
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            style={{
                                                backgroundColor: getTagColor(tag).background,
                                                color: getTagColor(tag).foreground,
                                            }}
                                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                        {job.description && (
                            <section className="space-y-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Job description
                                </h3>
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <RichTextDisplay value={job.description} />
                                </div>
                            </section>
                        )}
                        {job.notes && (
                            <section className="space-y-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Notes
                                </h3>
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <RichTextDisplay value={job.notes} />
                                </div>
                            </section>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDescOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Job Application</DialogTitle>
                        <DialogDescription>Update your job application details</DialogDescription>
                    </DialogHeader>
                    <FormProvider {...form}>
                        <form className="flex h-full min-h-0 flex-col " onSubmit={form.handleSubmit(handleUpdate)}>
                            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                                <JobApplicationForm />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Updating..." : "Update Application"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </>
    )
}

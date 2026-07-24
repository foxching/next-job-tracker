"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Award, Calendar, CheckCircle2, Edit2, ExternalLink, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-application";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import JobApplicationForm, { JobApplicationFormData } from "./form/job-application-form";
import { useBoardContext } from "./board-provider";
import { FormProvider, useForm } from "react-hook-form";

type CardDisplaySettings = {
    showSalary: boolean;
    showAppliedDate: boolean;
    showTags: boolean;
};

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
    cardDisplay: CardDisplaySettings;
}

function formatAppliedDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function JobApplicationCard({ job, columns, dragHandleProps, cardDisplay }: JobApplicationCardProps) {
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
                className="w-[320px] min-w-[250px] max-w-[250px] cursor-pointer transition-shadow hover:shadow-lg bg-card group shadow-sm"
                {...dragHandleProps}
                onClick={() => setIsDescOpen(true)}
            >
                <CardContent className="p-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-0.5 truncate">{job.position}</h3>
                            <p className="text-xs text-muted-foreground mb-1.5 truncate">
                                {job.company}
                            </p>

                            <div className="flex flex-col gap-0.5 mb-1">
                                {cardDisplay.showSalary && job.salary && (
                                    <span className="text-xs font-bold text-foreground">
                                        {job.salary}
                                    </span>
                                )}
                                {cardDisplay.showAppliedDate && job.appliedDate && (
                                    <span className="text-xs text-muted-foreground">
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
                                                className="
                                                    max-w-[100px]
                                                    px-2 py-1
                                                    text-xs
                                                    rounded-full
                                                    bg-blue-100
                                                    text-blue-700
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
                                            className="h-auto p-0 mt-2 text-xs text-blue-700 hover:underline"
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
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">{job.position}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            <p>{job.company}</p>
                            <p>{job.location}</p>
                            <p className="text-black-10">{job.salary}</p>
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        {job.description && (
                            <div className="mt-4">
                                <small className="text-sm text-muted-foreground">Job Description</small>
                                <p className="text-sm text-foreground whitespace-pre-wrap">{job.description}</p>
                            </div>
                        )}
                        {job.notes && (
                            <div className="mt-4">
                                <small className="text-sm text-muted-foreground">Job Notes</small>
                                <p className="text-sm text-foreground whitespace-pre-wrap">{job.notes}</p>
                            </div>
                        )}
                        {job.tags && job.tags.length > 0 && (
                            <div className="mt-4">
                                <small className="text-sm text-muted-foreground">Tags</small>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {job.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-700">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-4">
                            <small className="text-sm text-muted-foreground ml-2">Source</small>
                            {job.jobUrl && (
                                <a
                                    href={job.jobUrl}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
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

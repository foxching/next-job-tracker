"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Award, Calendar, CheckCircle2, Edit2, ExternalLink, Eye, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-application";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export default function JobApplicationCard({ job, columns, dragHandleProps, }: JobApplicationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDescOpen, setIsDescOpen] = useState(false);
    const [formData, setFormData] = useState({
        company: job.company,
        position: job.position,
        location: job.location || "",
        notes: job.notes || "",
        salary: job.salary || "",
        jobUrl: job.jobUrl || "",
        columnId: job.columnId || "",
        tags: job.tags?.join(", ") || "",
        description: job.description || "",
    });

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
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

            setIsEditing(false);
            setIsUpdating(false);
            toast.success("Job application updated successfully!");
        } catch {
            toast.error("Failed to update job application.");
            setIsUpdating(false);
        }
    }

    async function handleDelete() {
        try {
            const result = await deleteJobApplication(job._id);

            if (result.error) {
                toast.error("Failed to delete job application.");
                return;
            }

            toast.success("Job application deleted successfully!");
        } catch {
            toast.error("An error occurred while deleting the job application.");
        }
    }
    async function handleMove(newColumnId: string) {
        try {
            const result = await updateJobApplication(job._id, {
                columnId: newColumnId,
            });

            if (result.error) {
                toast.error("Failed to move the job application.");
                return;
            }

            toast.success("Job application moved successfully!");
        } catch {
            toast.error("An error occurred while moving the job application.");
        }
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
            <Card className="w-full max-w-[320px] mx-auto cursor-pointer transition-shadow hover:shadow-lg bg-card group shadow-sm"  {...dragHandleProps} onClick={() => setIsDescOpen(true)}>
                <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-0.5 truncate">{job.position}</h3>
                            <p className="text-xs text-muted-foreground mb-1 truncate">
                                {job.company}
                            </p>
                            <small className="text-xs font-bold text-foreground">{job.salary}</small>
                            <div>
                                {job.jobUrl && (
                                    <a
                                        href={job.jobUrl}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
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
                                                                handleMove(column._id)
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
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}>
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
            </Card >
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
                    <form className="flex h-full min-h-0 flex-col " onSubmit={handleUpdate}>
                        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company *</Label>
                                    <Input
                                        id="company"
                                        required
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({ ...formData, company: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position *</Label>
                                    <Input
                                        id="position"
                                        required
                                        value={formData.position}
                                        onChange={(e) =>
                                            setFormData({ ...formData, position: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({ ...formData, location: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input
                                        id="salary"
                                        placeholder="e.g., $100k - $150k"
                                        value={formData.salary}
                                        onChange={(e) =>
                                            setFormData({ ...formData, salary: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobUrl">Job URL</Label>
                                <Input
                                    id="jobUrl"
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.jobUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, jobUrl: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="React, Tailwind, High Pay"
                                    value={formData.tags}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tags: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Brief description of the role..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Updating..." : "Update Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
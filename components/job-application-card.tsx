"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { ExternalLink } from "lucide-react";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
}

export default function JobApplicationCard({ job, columns }: JobApplicationCardProps) {
    return (
        <Card>
            <CardContent>
                <div>
                    <div>
                        <h3 className="font-semibold text-sm mb-1">{job.position}</h3>
                        <p className="text-muted-foreground text-xs">{job.company}</p>
                        {job.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {job.description}
                            </p>
                        )}
                        {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {job.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
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
            </CardContent>
        </Card>
    )
}
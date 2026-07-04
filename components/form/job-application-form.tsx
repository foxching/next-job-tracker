"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export type JobApplicationFormData = {
    company: string;
    position: string;
    location: string;
    notes: string;
    salary: string;
    jobUrl: string;
    tags: string;
    appliedDate: string;
    description: string;
};

type JobApplicationFormProps = {
    formData: JobApplicationFormData;
    setFormData: React.Dispatch<React.SetStateAction<JobApplicationFormData>>;
};

export default function JobApplicationForm({
    formData,
    setFormData,
}: JobApplicationFormProps) {
    return (
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                company: e.target.value,
                            }))
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
                            setFormData((prev) => ({
                                ...prev,
                                position: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                location: e.target.value,
                            }))
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
                            setFormData((prev) => ({
                                ...prev,
                                salary: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jobUrl">Job URL</Label>
                    <Input
                        id="jobUrl"
                        type="url"
                        placeholder="https://..."
                        value={formData.jobUrl}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                jobUrl: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="appliedDate">Applied Date</Label>
                    <Input
                        id="appliedDate"
                        type="date"
                        value={formData.appliedDate}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                appliedDate: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        id="tags"
                        placeholder="React, Tailwind, High Pay"
                        value={formData.tags}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                tags: e.target.value,
                            }))
                        }
                    />
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/ai/suggest-tags", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ company: formData.company, position: formData.position, description: formData.description }),
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                    toast.error(data.error ?? "Upgrade to use tag suggestions");
                                    return;
                                }
                                if (data?.success) {
                                    setFormData((prev) => ({ ...prev, tags: data.tags.join(", ") }));
                                    toast.success("Suggested tags inserted");
                                }
                            } catch (err) {
                                console.error(err);
                                toast.error("Failed to suggest tags");
                            }
                        }}
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Suggest
                    </Button>
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={3}
                    placeholder="Brief description of the role..."
                    value={formData.description}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                />
            </div>

            <div className="space-y-2 mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                        }))
                    }
                />
            </div>
        </div>
    );
}
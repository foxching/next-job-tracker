"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";

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

export default function JobApplicationForm() {
    const {
        register,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<JobApplicationFormData>();

    return (
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                        id="company"
                        {...register("company", { required: "Company is required" })}
                    />
                    {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                        id="position"
                        {...register("position", { required: "Position is required" })}
                    />
                    {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        {...register("location")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                        id="salary"
                        placeholder="e.g., $100k - $150k"
                        {...register("salary")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jobUrl">Job URL</Label>
                    <Input
                        id="jobUrl"
                        type="url"
                        placeholder="https://..."
                        {...register("jobUrl", {
                            pattern: {
                                value: /^https?:\/\/\S+$/,
                                message: "Enter a valid URL",
                            },
                        })}
                    />
                    {errors.jobUrl && <p className="text-sm text-destructive">{errors.jobUrl.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="appliedDate">Applied Date</Label>
                    <Input
                        id="appliedDate"
                        type="date"
                        {...register("appliedDate")}
                    />
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        id="tags"
                        placeholder="React, Tailwind, High Pay"
                        {...register("tags")}
                    />
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/ai/suggest-tags", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        company: getValues("company"),
                                        position: getValues("position"),
                                        description: getValues("description"),
                                    }),
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                    toast.error(data.error ?? "Upgrade to use tag suggestions");
                                    return;
                                }
                                if (data?.success) {
                                    setValue("tags", data.tags.join(", "));
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
                    {...register("description")}
                />
            </div>

            <div className="space-y-2 mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    rows={4}
                    {...register("notes")}
                />
            </div>
        </div>
    );
}
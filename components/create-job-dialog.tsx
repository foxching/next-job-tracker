"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createJobApplication } from "@/lib/actions/job-application";
import { toast } from "sonner";
import JobApplicationForm from "./form/job-application-form";
import { useBoardContext } from "./board-provider";
import { FormProvider, useForm } from "react-hook-form";
import type { JobApplicationFormData } from "./form/job-application-form";

interface CreateJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

const INITIAL_FORM_DATA = {
    company: "",
    position: "",
    location: "",
    notes: "",
    salary: "",
    jobUrl: "",
    tags: "",
    appliedDate: "",
    description: "",
};

export default function CreateJobApplicationDialog({ columnId, boardId }: CreateJobApplicationDialogProps) {
    const [open, setOpen] = useState(false);
    const form = useForm<JobApplicationFormData>({
        defaultValues: INITIAL_FORM_DATA,
    });
    const { addJob } = useBoardContext();

    const handleSubmit = async (formData: JobApplicationFormData) => {
        try {
            const result = await createJobApplication({
                ...formData,
                columnId,
                boardId,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
            });

            if (result.error) {
                toast.error("Failed to create job application.");
                return;
            }

            if (result.data) {
                addJob(result.data);
            }

            form.reset(INITIAL_FORM_DATA);
            setOpen(false);
            toast.success("Job application created successfully!");
        } catch {
            toast.error("An error occurred while creating the job application.");
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full mb-4 justify-start text-foreground/60 border-dashed border-2 border-border hover:border-solid hover:bg-muted/30"
                >
                    <Plus />
                    Add Job
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Job Application</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new job application.
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <form className="flex h-full min-h-0 flex-col " onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
                            <JobApplicationForm />
                        </div>
                        <DialogFooter className="shrink-0 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Creating..." : "Create Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}

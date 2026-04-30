import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface CreateJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

export default function CreateJobApplicationDialog({ columnId, boardId }: CreateJobApplicationDialogProps) {
    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline" size="sm" >
                    <Plus />
                    Add Job
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Job Application</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new job application.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
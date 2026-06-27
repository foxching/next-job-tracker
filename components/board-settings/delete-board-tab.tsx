import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { deleteBoardAction } from "@/lib/actions/board";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface DeleteBoardTabProps {
    boardId: string;
    boardName: string;
    onClose: (open: boolean) => void;
}
export default function DeleteBoardTab({ boardId, boardName, onClose }: DeleteBoardTabProps) {
    const [loading, setLoading] = useState(false);

    const handleDeleteBoard = async () => {
        setLoading(true);
        try {
            const result = await deleteBoardAction(boardId);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success("Board deleted.");
        } catch {
            toast.error("Delete failed. Please try again.");
        } finally {
            setLoading(false);
            onClose(false)
        }
    };

    return (
        <>
            <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                    Danger zone
                </p>
                <p className="text-xs text-muted-foreground">
                    These actions are permanent and cannot be undone
                </p>
            </div>
            <div className="border border-destructive/30 rounded-md p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Delete this board</p>
                    <p className="text-xs text-muted-foreground">
                        Permanently remove this board and all its jobs
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            {loading ? "Deleting…" : "Delete"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{boardName}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the board and all its columns and job
                                applications. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteBoard}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                Delete board
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
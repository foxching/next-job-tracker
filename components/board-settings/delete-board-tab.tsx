import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export default function DeleteBoardTab() {
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
                <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                </Button>
            </div>
        </>
    )
}
"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createColumn, updateColumn } from "@/lib/actions/column";
import { Column } from "@/lib/models/models.types";
import { toast } from "sonner";
import {
    Award,
    Calendar,
    CheckCircle2,
    Mic,
    XCircle,
} from "lucide-react";

const ICON_OPTIONS = [
    { value: "Calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { value: "CheckCircle2", label: "Check", icon: <CheckCircle2 className="h-5 w-5" /> },
    { value: "Mic", label: "Mic", icon: <Mic className="h-5 w-5" /> },
    { value: "Award", label: "Award", icon: <Award className="h-5 w-5" /> },
    { value: "XCircle", label: "X", icon: <XCircle className="h-5 w-5" /> },
];

const COLOR_OPTIONS = [
    { value: "bg-cyan-500", label: "Cyan" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-red-500", label: "Red" },
];

interface CreateColumnDialogProps {
    boardId: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    column?: Column;
}

export default function CreateColumnDialog({
    boardId,
    open: controlledOpen,
    onOpenChange,
    column,
}: CreateColumnDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [name, setName] = useState(column ? column.name : "");
    const [icon, setIcon] = useState(column ? column.icon || "Calendar" : "Calendar");
    const [color, setColor] = useState(column ? column.color || "bg-cyan-500" : "bg-cyan-500");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isEditMode = Boolean(column);

    // Use controlled state if provided, otherwise use uncontrolled state
    const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setUncontrolledOpen(newOpen);
        }

        if (newOpen) {
            if (column) {
                setName(column.name);
                setIcon(column.icon || "Calendar");
                setColor(column.color || "bg-cyan-500");
            } else {
                setName("");
                setIcon("Calendar");
                setColor("bg-cyan-500");
            }
            return;
        }

        // Reset form when closing
        setName("");
        setIcon("Calendar");
        setColor("bg-cyan-500");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Column name is required");
            return;
        }

        setIsLoading(true);
        try {
            const result = isEditMode
                ? await updateColumn(column!._id, name.trim(), icon, color)
                : await createColumn(boardId, name.trim(), icon, color);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            handleOpenChange(false);
            router.refresh();
            toast.success(isEditMode ? "Column updated successfully!" : "Column created successfully!");
        } catch (error) {
            toast.error(
                isEditMode
                    ? "An error occurred while updating the column."
                    : "An error occurred while creating the column."
            );
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Column" : "Add New Column"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the column details for your board."
                            : "Create a new column for your board to organize job applications."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="column-name">Column Name</Label>
                        <Input
                            id="column-name"
                            placeholder="e.g., Applied, Interview, Offer"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Icon</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {ICON_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setIcon(option.value)}
                                    className={`flex h-14 flex-col items-center justify-center rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${icon === option.value
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-background hover:border-secondary"
                                        }`}
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        {option.icon}
                                    </span>
                                    <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label>Background</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {COLOR_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setColor(option.value)}
                                    className={`flex h-14 flex-col items-center justify-center rounded-lg border p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${color === option.value
                                        ? "border-primary"
                                        : "border-border hover:border-secondary"
                                        }`}
                                >
                                    <span className={`h-10 w-10 rounded-full ${option.value}`} />
                                    <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? isEditMode
                                    ? "Saving..."
                                    : "Creating..."
                                : isEditMode
                                    ? "Save Changes"
                                    : "Create Column"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

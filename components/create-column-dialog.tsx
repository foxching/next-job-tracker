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
import { useState } from "react";
import { createColumn, updateColumn } from "@/lib/actions/column";
import { Column } from "@/lib/models/models.types";
import { toast } from "sonner";
import { useBoardContext } from "./board-provider";
import {
    Award,
    Calendar,
    CheckCircle2,
    Mic,
    XCircle,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

const ICON_OPTIONS = [
    { value: "Calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { value: "CheckCircle2", label: "Check", icon: <CheckCircle2 className="h-5 w-5" /> },
    { value: "Mic", label: "Mic", icon: <Mic className="h-5 w-5" /> },
    { value: "Award", label: "Award", icon: <Award className="h-5 w-5" /> },
    { value: "XCircle", label: "X", icon: <XCircle className="h-5 w-5" /> },
];

const LEGACY_COLORS: Record<string, string> = {
    "bg-cyan-500": "#06B6D4",
    "bg-purple-500": "#A855F7",
    "bg-green-500": "#00C853",
    "bg-yellow-500": "#F4B400",
    "bg-red-500": "#FF3344",
};

function toPickerColor(color?: string) {
    return color && LEGACY_COLORS[color] ? LEGACY_COLORS[color] : color || "#06B6D4";
}

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
    const [color, setColor] = useState(toPickerColor(column?.color));
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [draftColor, setDraftColor] = useState(toPickerColor(column?.color));
    const [isLoading, setIsLoading] = useState(false);
    const { addColumn, updateColumn: updateColumnState } = useBoardContext();

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
                setColor(toPickerColor(column.color));
                setDraftColor(toPickerColor(column.color));
            } else {
                setName("");
                setIcon("Calendar");
                setColor("#06B6D4");
                setDraftColor("#06B6D4");
            }
            return;
        }

        // Reset form when closing
        setName("");
        setIcon("Calendar");
        setColor("#06B6D4");
        setDraftColor("#06B6D4");
        setColorPickerOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Column name is required");
            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            toast.error("Enter a valid six-digit hex color");
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

            if (result.column) {
                if (isEditMode) {
                    updateColumnState(result.column);
                } else {
                    addColumn(result.column);
                }
            }

            handleOpenChange(false);
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
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onClick={() => {
                                setDraftColor(color);
                                setColorPickerOpen(true);
                            }}
                            disabled={isLoading}
                        >
                            <span
                                className="h-9 w-9 shrink-0 rounded-md border"
                                style={{ backgroundColor: color }}
                            />
                            <span className="flex flex-col">
                                <span className="text-sm font-medium">Choose background color</span>
                                <span className="text-xs text-muted-foreground">{color}</span>
                            </span>
                        </button>
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
            <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <DialogContent className="w-[min(22rem,calc(100%-2rem))] max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Choose background color</DialogTitle>
                        <DialogDescription>Pick a color for this column header.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-center rounded-lg border bg-muted/20 p-3">
                            <HexColorPicker color={draftColor} onChange={setDraftColor} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="h-9 w-9 shrink-0 rounded-md border"
                                style={{ backgroundColor: draftColor }}
                            />
                            <Input
                                value={draftColor}
                                onChange={(event) => setDraftColor(event.target.value)}
                                placeholder="#06B6D4"
                                maxLength={7}
                                aria-label="Hex background color"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setColorPickerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!/^#[0-9A-Fa-f]{6}$/.test(draftColor)) {
                                    toast.error("Enter a valid six-digit hex color");
                                    return;
                                }
                                setColor(draftColor);
                                setColorPickerOpen(false);
                            }}
                        >
                            Apply Color
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

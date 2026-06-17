import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Board } from "@/lib/models/models.types";


const BOARD_COLORS = [
    "#e91e8c",
    "#378ADD",
    "#1D9E75",
    "#EF9F27",
    "#7F77DD",
    "#D85A30",
    "#888780",
];

export default function GeneralTab({ board }: { board: Board }) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="board-name">Board name</Label>
                <Input id="board-name" defaultValue={board.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="board-description">Description</Label>
                <Textarea
                    id="board-description"
                    placeholder="e.g. 2025 job search tracking..."
                    rows={3}
                    defaultValue={board.description}
                />
            </div>

            <div className="space-y-2">
                <Label>Board accent color</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                    {BOARD_COLORS.map((color, i) => (
                        <button
                            key={color}
                            type="button"
                            style={{ backgroundColor: color }}
                            className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center",
                                i === 0 &&
                                "ring-2 ring-offset-2 ring-foreground/40"
                            )}
                            aria-label={`Select color ${color}`}
                        >
                            {i === 0 && (
                                <Check className="w-3.5 h-3.5 text-white" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
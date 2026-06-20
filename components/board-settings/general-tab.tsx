import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralFormValues } from "@/lib/models/models.types";


const BOARD_COLORS = [
    "#e91e8c",
    "#378ADD",
    "#1D9E75",
    "#EF9F27",
    "#7F77DD",
    "#D85A30",
    "#888780",
];

type GeneralTabProps = {
    values: GeneralFormValues;
    onChange: (values: GeneralFormValues) => void;
};

export default function GeneralTab({ values, onChange }: GeneralTabProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="board-name">Board name</Label>
                <Input id="board-name"
                    value={values.name}
                    onChange={(e) => onChange({ ...values, name: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="board-description">Description</Label>
                <Textarea
                    id="board-description"
                    placeholder="e.g. 2025 job search tracking..."
                    rows={3}
                    value={values.description}
                    onChange={(e) =>
                        onChange({ ...values, description: e.target.value })
                    }
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
                                values.themeColor === color &&
                                "ring-2 ring-offset-2 ring-foreground/40"
                            )}
                            aria-label={`Select color ${color}`}
                            onClick={() => onChange({ ...values, themeColor: color })}
                        >
                            {values.themeColor === color && (
                                <Check className="w-3.5 h-3.5 text-white" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
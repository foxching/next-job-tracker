"use client";

import { Calendar, Building2, Briefcase, Hand, ArrowDown, ArrowUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortingFormValues } from "@/lib/models/models.types";


type SortingTabProps = {
    values: SortingFormValues;
    onChange: (values: SortingFormValues) => void;
};

const SORT_FIELDS: {
    value: SortingFormValues["field"];
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
        {
            value: "manual",
            label: "Manual",
            description: "Drag & drop order",
            icon: <Hand className="w-[18px] h-[18px]" />,
        },
        {
            value: "createdAt",
            label: "Date added",
            description: "When card was created",
            icon: <Calendar className="w-[18px] h-[18px]" />,
        },
        {
            value: "company",
            label: "Company",
            description: "Alphabetical",
            icon: <Building2 className="w-[18px] h-[18px]" />,
        },
        {
            value: "position",
            label: "Position",
            description: "Alphabetical",
            icon: <Briefcase className="w-[18px] h-[18px]" />,
        },
    ];

export default function SortingTab({ values, onChange }: SortingTabProps) {
    const isManual = values.field === "manual";

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm font-medium">Sorting</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Set the default order for cards within each column
                </p>
            </div>

            <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2">Sort cards by</p>
                <div className="grid grid-cols-2 gap-2">
                    {SORT_FIELDS.map(({ value, label, description, icon }) => {
                        const selected = values.field === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => onChange({ ...values, field: value })}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors",
                                    selected
                                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                                        : "border-border bg-background hover:bg-muted/50"
                                )}
                            >
                                <span
                                    className={cn(
                                        selected
                                            ? "text-blue-700 dark:text-blue-300"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {icon}
                                </span>
                                <div>
                                    <div
                                        className={cn(
                                            "text-sm font-medium",
                                            selected &&
                                            "text-blue-700 dark:text-blue-300"
                                        )}
                                    >
                                        {label}
                                    </div>
                                    <div
                                        className={cn(
                                            "text-[11px]",
                                            selected
                                                ? "text-blue-700/80 dark:text-blue-300/80"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div
                className={cn(
                    "mb-6 transition-opacity",
                    isManual && "opacity-40 pointer-events-none"
                )}
            >
                <p className="text-xs text-muted-foreground mb-2">Direction</p>
                <div className="inline-flex rounded-md border border-border overflow-hidden">
                    <button
                        type="button"
                        disabled={isManual}
                        onClick={() => onChange({ ...values, direction: "desc" })}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2 text-sm border-r border-border",
                            values.direction === "desc" && !isManual && "bg-muted"
                        )}
                    >
                        <ArrowDown className="w-[15px] h-[15px]" />
                        Newest first
                    </button>
                    <button
                        type="button"
                        disabled={isManual}
                        onClick={() => onChange({ ...values, direction: "asc" })}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2 text-sm",
                            values.direction === "asc" && !isManual && "bg-muted"
                        )}
                    >
                        <ArrowUp className="w-[15px] h-[15px]" />
                        Oldest first
                    </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Not applicable for manual ordering
                </p>
            </div>

            <div className="border-t border-border pt-4">
                <div className="flex items-start gap-2 px-3 py-2.5 bg-muted/50 rounded-md">
                    <Info className="w-[15px] h-[15px] text-muted-foreground shrink-0 mt-px" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This sets the default order when the board loads. Dragging a
                        card always switches the board to manual ordering.
                    </p>
                </div>
            </div>
        </div>
    );
}

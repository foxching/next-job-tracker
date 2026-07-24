"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Column } from "@/lib/models/models.types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type ColumnFormValues = {
    [columnId: string]: {
        name: string;
    };
};

type ColumnTabProps = {
    columns: Column[];
    values: ColumnFormValues;
    onChange: (values: ColumnFormValues) => void;
    onDeleteColumn: (columnId: string) => void;
};

export default function ColumnTab({
    columns,
    values,
    onChange,
    onDeleteColumn,
}: ColumnTabProps) {
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    const handleNameChange = (columnId: string, name: string) => {
        onChange({
            ...values,
            [columnId]: { ...values[columnId], name },
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-1 shrink-0">
                <p className="text-sm font-medium">Manage columns</p>
                <p className="text-xs text-muted-foreground">
                    Rename or remove pipeline stages. Columns with active
                    applications can't be deleted.
                </p>
            </div>

            {sortedColumns.length === 0 ? (
                <p className="text-sm text-muted-foreground italic mt-4">
                    No columns yet.
                </p>
            ) : (
                <div className="mt-4 flex-1 min-h-0 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Color</TableHead>
                                <TableHead>Column Name</TableHead>
                                <TableHead className="w-28">Jobs</TableHead>
                                <TableHead className="w-16 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sortedColumns.map((column) => {
                                const jobCount =
                                    column.jobApplications?.length ?? 0;
                                const hasJobs = jobCount > 0;
                                const currentName =
                                    values[column._id]?.name ?? column.name;

                                return (
                                    <TableRow key={column._id}>
                                        <TableCell>
                                            <div
                                                className={`w-6 h-6 rounded-full border ${column.color?.startsWith("#") ? "" : column.color || "bg-cyan-500"}`}
                                                style={column.color?.startsWith("#") ? { backgroundColor: column.color } : undefined}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Input
                                                value={currentName}
                                                onChange={(e) =>
                                                    handleNameChange(
                                                        column._id,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="secondary">
                                                {jobCount}{" "}
                                                {jobCount === 1
                                                    ? "job"
                                                    : "jobs"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={hasJobs}
                                                className="text-destructive hover:text-destructive disabled:opacity-40"
                                                title={
                                                    hasJobs
                                                        ? "Move or delete applications in this column first"
                                                        : "Delete column"
                                                }
                                                onClick={() => onDeleteColumn(column._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

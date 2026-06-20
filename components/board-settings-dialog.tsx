"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    Columns3,
    SquareStack,
    ArrowUpDown,
    DatabaseBackup,
    Trash2,
} from "lucide-react";
import GeneralTab from "./board-settings/general-tab";
import CardDisplayTab from "./board-settings/card-display-tab";
import { Board, CardDisplayFormValues, ColumnFormValues, GeneralFormValues } from "@/lib/models/models.types";
import { useState } from "react";
import { updateBoardDetails } from "@/lib/actions/board";
import { updateCardDisplaySettings } from "@/lib/actions/board";
import { toast } from "sonner";
import ColumnTab from "./board-settings/column-tab";
import { bulkUpdateColumnNames, deleteColumn } from "@/lib/actions/column";
import SortingTab from "./board-settings/sorting-tab";
import DataTab from "./board-settings/data-tab";
import DeleteBoardTab from "./board-settings/delete-board-tab";

type BoardSettingsDialogProps = {
    board: Board;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const TABS = [
    { value: "general", label: "General", icon: LayoutGrid },
    { value: "columns", label: "Columns", icon: Columns3 },
    { value: "cards", label: "Card display", icon: SquareStack },
    { value: "sorting", label: "Sorting", icon: ArrowUpDown },
    { value: "data", label: "Data", icon: DatabaseBackup },
] as const;


export default function BoardSettingsDialog({
    board,
    open,
    onOpenChange,
}: BoardSettingsDialogProps) {
    const [selectedTab, setSelectedTab] = useState<string>("general");
    const [isSaving, setIsSaving] = useState(false);

    const [generalValues, setGeneralValues] = useState<GeneralFormValues>({
        name: board.name,
        description: board.description ?? "",
        themeColor: board.themeColor ?? "#e91e8c",
    });

    const [columnValues, setColumnValues] = useState<ColumnFormValues>(
        Object.fromEntries(board.columns.map((c) => [c._id, { name: c.name }]))
    );


    const [cardDisplayValues, setCardDisplayValues] = useState<CardDisplayFormValues>({
        showSalary: board.settings?.cardDisplay?.showSalary ?? true,
        showAppliedDate: board.settings?.cardDisplay?.showAppliedDate ?? false,
        showTags: board.settings?.cardDisplay?.showTags ?? true,
    });

    const handleDeleteColumn = async (columnId: string) => {
        const result = await deleteColumn(columnId);
        if (result?.error) {
            toast.error("Failed to delete column.");
        } else {
            toast.success("Column deleted.");
            setColumnValues((prev) => {
                const next = { ...prev };
                delete next[columnId];
                return next;
            });
        }
    };


    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setGeneralValues({
                name: board.name,
                description: board.description ?? "",
                themeColor: board.themeColor ?? "#e91e8c",
            });
            setCardDisplayValues({
                showSalary: board.settings?.cardDisplay?.showSalary ?? true,
                showAppliedDate: board.settings?.cardDisplay?.showAppliedDate ?? false,
                showTags: board.settings?.cardDisplay?.showTags ?? true,
            });
            setColumnValues(
                Object.fromEntries(
                    board.columns.map((c) => [c._id, { name: c.name }])
                )
            );

        }
        onOpenChange(next);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            if (selectedTab === "general") {
                await updateBoardDetails(board._id, {
                    name: generalValues.name,
                    description: generalValues.description,
                    themeColor: generalValues.themeColor,
                });
                toast.success("Board details updated");
            }
            if (selectedTab === "cards") {
                await updateCardDisplaySettings(board._id, cardDisplayValues);
            }
            if (selectedTab === "columns") {
                const changedUpdates = board.columns
                    .filter(
                        (col) =>
                            columnValues[col._id] &&
                            columnValues[col._id].name.trim() !== col.name
                    )
                    .map((col) => ({
                        columnId: col._id,
                        name: columnValues[col._id].name,
                    }));

                if (changedUpdates.length > 0) {
                    const result = await bulkUpdateColumnNames(changedUpdates);
                    if (result?.error) {
                        toast.error(result.error);
                        setIsSaving(false);
                        return; // don't close the dialog on partial/failed save
                    }
                }
            }
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save board settings", err);
            toast.error("Failed to update board details");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle>Board Settings</DialogTitle>
                        <DialogDescription>
                            Manage your board preferences and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs
                        value={selectedTab}
                        onValueChange={setSelectedTab}
                        orientation="vertical"
                        className="flex-1 flex flex-row overflow-hidden min-h-0"
                    >
                        {/* Sidebar tab list */}
                        <TabsList className="flex flex-col h-full w-44 shrink-0 justify-start items-stretch rounded-none bg-muted/40 border-r p-2 gap-1">
                            {TABS.map(({ value, label, icon: Icon }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className={cn(
                                        "w-full justify-start gap-2 px-3 py-2 text-sm",
                                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                        "data-[state=active]:border-l-2 data-[state=active]:border-l-pink-500",
                                        "rounded-md"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </TabsTrigger>
                            ))}

                            <Separator className="my-1" />

                            <TabsTrigger
                                value="danger"
                                className={cn(
                                    "w-full justify-start gap-2 px-3 py-2 text-sm text-destructive",
                                    "data-[state=active]:bg-destructive/10 data-[state=active]:border-l-2 data-[state=active]:border-l-destructive",
                                    "rounded-md"
                                )}
                            >
                                <Trash2 className="w-4 h-4" />
                                Danger zone
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">

                            <TabsContent value="general" className="mt-0 space-y-5 overflow-y-auto data-[state=inactive]:hidden">
                                <GeneralTab values={generalValues} onChange={setGeneralValues} />
                            </TabsContent>

                            <TabsContent value="columns" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
                                <ColumnTab
                                    columns={board.columns}
                                    values={columnValues}
                                    onChange={setColumnValues}
                                    onDeleteColumn={handleDeleteColumn}
                                />
                            </TabsContent>

                            <TabsContent value="cards" className="mt-0 space-y-4 overflow-y-auto data-[state=inactive]:hidden">
                                <CardDisplayTab values={cardDisplayValues} onChange={setCardDisplayValues} />
                            </TabsContent>

                            <TabsContent value="sorting" className="mt-0 space-y-4 overflow-y-auto data-[state=inactive]:hidden">
                                <SortingTab />
                            </TabsContent>

                            <TabsContent value="data" className="mt-0 space-y-4 overflow-y-auto data-[state=inactive]:hidden">
                                <DataTab />
                            </TabsContent>

                            <TabsContent value="danger" className="mt-0 space-y-4 overflow-y-auto data-[state=inactive]:hidden">
                                <DeleteBoardTab />
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter className="px-6 py-4 border-t">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
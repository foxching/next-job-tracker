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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    Columns3,
    SquareStack,
    ArrowUpDown,
    DatabaseBackup,
    Trash2,
    Check,
} from "lucide-react";

type BoardSettingsDialogProps = {
    boardId: string;
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

const BOARD_COLORS = [
    "#e91e8c",
    "#378ADD",
    "#1D9E75",
    "#EF9F27",
    "#7F77DD",
    "#D85A30",
    "#888780",
];

export default function BoardSettingsDialog({
    boardId,
    open,
    onOpenChange,
}: BoardSettingsDialogProps) {
    const handleOpenChange = (open: boolean) => onOpenChange(open);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Board Settings</DialogTitle>
                    <DialogDescription>
                        Manage your board preferences and settings.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue="general"
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

                    {/* Content area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* GENERAL */}
                        <TabsContent value="general" className="mt-0 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="board-name">Board name</Label>
                                <Input id="board-name" defaultValue="My Board" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="board-description">Description</Label>
                                <Textarea
                                    id="board-description"
                                    placeholder="e.g. 2025 job search tracking..."
                                    rows={3}
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

                            <Separator />

                            <div className="space-y-1">
                                <p className="text-sm font-medium">Visibility</p>
                                <p className="text-xs text-muted-foreground">
                                    Control what shows on each job card
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-salary" className="font-normal">
                                            Show salary on cards
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Display salary range below job title
                                        </p>
                                    </div>
                                    <Switch id="show-salary" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-date" className="font-normal">
                                            Show applied date
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Date each job was added
                                        </p>
                                    </div>
                                    <Switch id="show-date" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-tags" className="font-normal">
                                            Show tags & labels
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Priority, remote, job type badges
                                        </p>
                                    </div>
                                    <Switch id="show-tags" />
                                </div>
                            </div>
                        </TabsContent>

                        {/* COLUMNS */}
                        <TabsContent value="columns" className="mt-0 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Manage columns</p>
                                <p className="text-xs text-muted-foreground">
                                    Add, remove, reorder, or rename pipeline stages
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                Column management UI goes here.
                            </p>
                        </TabsContent>

                        {/* CARD DISPLAY */}
                        <TabsContent value="cards" className="mt-0 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Card display</p>
                                <p className="text-xs text-muted-foreground">
                                    Choose what appears on each job card
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                Card display options go here.
                            </p>
                        </TabsContent>

                        {/* SORTING */}
                        <TabsContent value="sorting" className="mt-0 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Sorting & filtering</p>
                                <p className="text-xs text-muted-foreground">
                                    Set default order and manage saved filters
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                Sorting options go here.
                            </p>
                        </TabsContent>

                        {/* DATA */}
                        <TabsContent value="data" className="mt-0 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Data</p>
                                <p className="text-xs text-muted-foreground">
                                    Export, duplicate, or archive this board
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                Export / duplicate / archive actions go here.
                            </p>
                        </TabsContent>

                        {/* DANGER ZONE */}
                        <TabsContent value="danger" className="mt-0 space-y-4">
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
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
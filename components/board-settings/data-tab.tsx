"use client";

import { useEffect, useState } from "react";
import { Download, Copy, Archive } from "lucide-react";
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

import { duplicateBoardAction, exportBoardAction } from "@/lib/actions/board";
import * as XLSX from "xlsx-js-style";

interface ActionCardProps {
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonClass: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const ActionCard = ({
    icon,
    iconClass,
    title,
    description,
    buttonLabel,
    buttonClass,
    onClick,
    loading,
    disabled,
}: ActionCardProps) => (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
            {icon}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            onClick={onClick}
            disabled={loading || disabled}
            className={`shrink-0 self-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${buttonClass}`}
        >
            {loading ? "Please wait…" : buttonLabel}
        </button>
    </div>
);

interface BoardSettingsDataTabProps {
    boardId: string;
    boardName: string;
}

const BoardSettingsDataTab = ({ boardId, boardName }: BoardSettingsDataTabProps) => {
    const [exportLoading, setExportLoading] = useState(false);
    const [duplicateLoading, setDuplicateLoading] = useState(false);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [plan, setPlan] = useState<"free" | "premium" | "unknown">("unknown");

    useEffect(() => {
        let mounted = true;
        fetch("/api/subscription")
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                setPlan(data?.plan === "premium" ? "premium" : "free");
            })
            .catch(() => {
                if (!mounted) return;
                setPlan("free");
            });
        return () => {
            mounted = false;
        };
    }, []);

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const result = await exportBoardAction(boardId);

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            const wb = XLSX.utils.book_new();

            // One sheet per column
            for (const column of result.data.columns) {
                const rows = column.jobApplications.map((job) => ({
                    Company: job.company ?? "",
                    Position: job.position,
                    Location: job.location,
                    Salary: job.salary ?? "",
                    "Job URL": job.jobUrl ?? "",
                    "Applied Date": job.appliedDate,
                    Tags: (job.tags ?? []).join(", "),
                    Notes: job.notes ?? "",
                    "Created At": job.createdAt,
                    "Updated At": job.updatedAt,
                }));

                const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);

                // Bold header row
                const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
                    if (ws[cellRef]) {
                        ws[cellRef].s = {
                            font: { bold: true },
                            fill: { fgColor: { rgb: "F3F4F6" } },
                        };
                    }
                }

                ws["!cols"] = [
                    { wch: 20 }, // Company
                    { wch: 30 }, // Position
                    { wch: 20 }, // Location
                    { wch: 15 }, // Salary
                    { wch: 35 }, // Job URL
                    { wch: 15 }, // Applied Date
                    { wch: 20 }, // Tags
                    { wch: 40 }, // Notes
                    { wch: 20 }, // Created At
                    { wch: 20 }, // Updated At
                ];

                // Sheet name max 31 chars, strip invalid chars
                const sheetName = column.name.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            }

            const filename = result.filename.replace(".json", ".xlsx");
            XLSX.writeFile(wb, filename);

            toast.success("Board exported.");
        } catch {
            toast.error("Export failed. Please try again.");
        } finally {
            setExportLoading(false);
        }
    };

    const handleDuplicate = async () => {
        setDuplicateLoading(true);
        try {
            const result = await duplicateBoardAction(boardId);

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            toast.success(`"${result.boardName}" created.`);
        } catch {
            toast.error("Duplicate failed. Please try again.");
        } finally {
            setDuplicateLoading(false);
        }
    };


    const handleArchive = async () => {
        setArchiveLoading(true);
        try {
            // TODO: replace with actual archive server action
            // await archiveBoard(boardId);
            await new Promise((r) => setTimeout(r, 1000));
            toast.success(`"${boardName}" archived.`);
        } catch {
            toast.error("Archive failed. Please try again.");
        } finally {
            setArchiveLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2">
                <h3 className="text-base font-medium text-gray-900">Data</h3>
                <p className="text-sm text-gray-500">Export, duplicate, or archive this board.</p>
            </div>

            <ActionCard
                icon={<Download size={17} />}
                iconClass="bg-blue-50 text-blue-600"
                title="Export board"
                description="Download all cards and column data as a JSON file."
                buttonLabel="Export"
                buttonClass="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                onClick={handleExport}
                loading={exportLoading}
                disabled={plan === "free"}
            />

            <ActionCard
                icon={<Copy size={17} />}
                iconClass="bg-green-50 text-green-600"
                title="Duplicate board"
                description="Create a full copy of this board including all columns and cards."
                buttonLabel="Duplicate"
                buttonClass="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                onClick={handleDuplicate}
                loading={duplicateLoading}
                disabled={plan === "free"}
            />

            {plan === "free" && (
                <div className="rounded-md border border-dashed border-gray-200 bg-white p-3">
                    <p className="text-sm text-gray-700">
                        Exporting and duplicating boards are premium features. Upgrade to unlock these tools.
                    </p>
                    <div className="mt-2">
                        <a href="/profile" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">
                            Upgrade
                        </a>
                    </div>
                </div>
            )}

            <AlertDialog>
                <div>
                    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Archive size={17} />
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5">
                            <p className="text-sm font-medium text-gray-900">Archive board</p>
                            <p className="text-sm text-gray-500">
                                Hide this board from your workspace. You can restore it later.
                            </p>
                        </div>
                        <AlertDialogTrigger asChild>
                            <button
                                disabled={archiveLoading}
                                className="shrink-0 self-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                            >
                                {archiveLoading ? "Please wait…" : "Archive"}
                            </button>
                        </AlertDialogTrigger>
                    </div>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive "{boardName}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This board will be hidden from your workspace. All cards and columns are
                            preserved — you can restore it at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                            className="bg-amber-500 text-white hover:bg-amber-600"
                        >
                            Archive board
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BoardSettingsDataTab;

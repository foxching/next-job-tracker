"use client";

import { useState } from "react";
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

interface ActionCardProps {
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonClass: string;
    onClick: () => void;
    loading?: boolean;
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
            disabled={loading}
            className={`shrink-0 self-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${buttonClass}`}
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

    const handleExport = async () => {
        setExportLoading(true);
        try {
            // TODO: replace with actual export server action / API call
            // const data = await exportBoard(boardId);
            // const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = `${boardName}.json`;
            // a.click();
            await new Promise((r) => setTimeout(r, 1000)); // remove once wired up
            toast.success("Board exported successfully.");
        } catch {
            toast.error("Export failed. Please try again.");
        } finally {
            setExportLoading(false);
        }
    };

    const handleDuplicate = async () => {
        setDuplicateLoading(true);
        try {
            // TODO: replace with actual duplicate server action
            // await duplicateBoard(boardId);
            await new Promise((r) => setTimeout(r, 1000));
            toast.success(`"${boardName}" duplicated.`);
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
            />

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

"use client";

import { Filter, Columns3, ArrowUpDown, LayoutDashboard } from "lucide-react";
import { Board, SAMPLE_BOARD_BACKGROUND_URL } from "@/lib/models/models.types";
import { BoardProvider, useBoardContext } from "./board-provider";
import BoardMenu from "./board-menu";
import BoardSwitcher from "./board-swticher";
import EditableBoardTitle from "./editable-board-title";
import KanbanBoard from "./kanban-board";
import FilterModal from "./filter-modal";
import { Button } from "./ui/button";
import { useState } from "react";
import CreateColumnDialog from "./create-column-dialog";
import { cn } from "@/lib/utils";
import CreateJobApplicationDialog from "./create-job-dialog";

function DashboardBoardContent({ boards }: { boards: Board[] }) {
    const { board, isSwitchingBoard, columns } = useBoardContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        query: "",
        selectedColumns: [] as string[],
        selectedTags: [] as string[],
        hasSalary: "all" as "all" | "with-salary" | "without-salary",
        hasNotes: "all" as "all" | "with-notes" | "without-notes",
    });
    const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);

    return (
        <>
            <section
                className={cn(
                    "dashboard-workspace relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden px-2 pb-3 pt-2 sm:px-3 sm:pb-5 sm:pt-3",
                    isSwitchingBoard && "opacity-90"
                )}
                style={{
                    backgroundImage: `linear-gradient(120deg, rgba(16, 32, 40, 0.18), rgba(16, 32, 40, 0.04)), url("${encodeURI(board.backgroundImageUrl || SAMPLE_BOARD_BACKGROUND_URL)}")`,
                }}
            >
                <div
                    className={cn(
                        "dashboard-board-toolbar mb-3 flex w-full shrink-0 flex-col gap-3 rounded-xl px-3 py-2 transition-opacity duration-200 ease-out md:flex-row md:items-center md:justify-between sm:px-4 sm:py-2.5",
                        isSwitchingBoard ? "opacity-60" : "opacity-100"
                    )}
                >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <EditableBoardTitle
                            key={`${board._id}-${board.name}`}
                            boardId={board._id}
                            initialName={board.name}
                        />
                        <BoardSwitcher boards={boards} />
                        {columns.length > 0 && (
                            <CreateJobApplicationDialog
                                boardId={board._id}
                                columnId={[...columns].sort((a, b) => a.order - b.order)[0]._id}
                                iconOnly
                            />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Add column"
                            title="Add column"
                            onClick={() => setShowAddColumnDialog(true)}
                        >
                            <Columns3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Filter applications"
                            title="Filter applications"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Sort applications"
                            title="Sort applications"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Change board view"
                            title="Change board view"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                        </Button>
                        <BoardMenu />
                    </div>
                </div>
                <div
                    className={`flex-1 min-h-0 overflow-hidden transition-all duration-300 ease-out ${isSwitchingBoard ? "translate-y-1 opacity-40" : "translate-y-0 opacity-100"
                        }`}
                >
                    <KanbanBoard externalFilters={filters} />
                </div>

                <FilterModal open={isFilterOpen} onOpenChange={setIsFilterOpen} columns={columns} filters={filters} setFilters={setFilters} />
                {showAddColumnDialog && (
                    <CreateColumnDialog
                        boardId={board._id}
                        open={showAddColumnDialog}
                        onOpenChange={setShowAddColumnDialog}
                    />
                )}
            </section>
        </>
    );
}

export default function DashboardBoardShell({
    board,
    boards,
}: {
    board: Board;
    boards: Board[];
}) {
    return (
        <BoardProvider key={board._id} initialBoard={board} initialBoards={boards}>
            <DashboardBoardContent boards={boards} />
        </BoardProvider>
    );
}

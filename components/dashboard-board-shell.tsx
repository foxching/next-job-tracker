"use client";

import { Plus, Filter, Columns3, ArrowUpDown, LayoutDashboard, MoreHorizontal } from "lucide-react";
import { Board } from "@/lib/models/models.types";
import { BoardProvider, useBoardContext } from "./board-provider";
import BoardMenu from "./board-menu";
import BoardSwitcher from "./board-swticher";
import EditableBoardTitle from "./editable-board-title";
import KanbanBoard from "./kanban-board";
import FilterModal from "./filter-modal";
import { Button } from "./ui/button";
import { useState } from "react";

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

    return (
        <>
            <div
                className={`mb-6 flex flex-col gap-4 px-2 transition-opacity duration-200 ease-out md:flex-row md:items-end md:justify-between ${isSwitchingBoard ? "opacity-60" : "opacity-100"
                    }`}
            >
                <div className="flex items-center gap-4">
                    <EditableBoardTitle
                        key={`${board._id}-${board.name}`}
                        boardId={board._id}
                        initialName={board.name}
                    />
                    <BoardSwitcher boards={boards} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Add application
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Add column"
                        title="Add column"
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

                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="More board actions"
                        title="More board actions"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>


                    {/* <BoardMenu />
                    <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New application
                    </Button> */}
                </div>
            </div>
            <div
                className={`flex-1 overflow-hidden transition-all duration-300 ease-out ${isSwitchingBoard ? "translate-y-1 opacity-40" : "translate-y-0 opacity-100"
                    }`}
            >
                <KanbanBoard externalFilters={filters} setExternalFilters={setFilters} />
            </div>

            <FilterModal open={isFilterOpen} onOpenChange={setIsFilterOpen} columns={columns} filters={filters} setFilters={setFilters} />
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

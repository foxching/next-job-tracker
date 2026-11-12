"use client";

import { ArrowUpDown, Briefcase, Columns3, Filter, LayoutDashboard, Search, UserRound } from "lucide-react";
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
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

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
                    "dashboard-workspace relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden pb-1 sm:pb-2",
                    isSwitchingBoard && "opacity-90"
                )}
                style={{
                    backgroundImage: `linear-gradient(120deg, rgba(16, 32, 40, 0.18), rgba(16, 32, 40, 0.04)), url("${encodeURI(board.backgroundImageUrl || SAMPLE_BOARD_BACKGROUND_URL)}")`,
                }}
            >
                <header className="dashboard-topbar z-10 flex min-h-14 shrink-0 items-center gap-3 border-b px-3 py-2 sm:px-5">
                    <Link
                        href="/dashboard"
                        className="flex shrink-0 items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight text-white"
                    >
                        <Briefcase className="h-5 w-5 text-white" aria-hidden="true" />
                        <span className="hidden sm:inline">Job Tracker</span>
                    </Link>
                    <label className="relative mx-auto flex h-9 min-w-0 max-w-3xl flex-1 items-center">
                        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input
                            type="search"
                            value={filters.query}
                            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                            placeholder="Search applications"
                            aria-label="Search job applications"
                            className="h-full w-full rounded-md border border-slate-300 bg-white/80 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
                        />
                    </label>
                    <CreateJobApplicationDialog
                        boardId={board._id}
                        columnId={[...columns].sort((a, b) => a.order - b.order)[0]?._id ?? ""}
                        triggerLabel="Create"
                        disabled={columns.length === 0}
                    />
                    <div className="flex shrink-0 items-center gap-1">
                        <ThemeToggle />
                        <Link
                            href="/profile"
                            aria-label="Profile"
                            title="Profile"
                            className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                            <UserRound className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden md:inline">Profile</span>
                        </Link>
                    </div>
                </header>
                <div
                    className={cn(
                        "dashboard-board-toolbar mx-2 mt-2 mb-3 flex w-[calc(100%-1rem)] shrink-0 flex-col gap-3 rounded-xl px-3 py-2 transition-opacity duration-200 ease-out sm:mx-3 sm:w-[calc(100%-1.5rem)] sm:px-4 sm:py-2.5 md:flex-row md:items-center md:justify-between",
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

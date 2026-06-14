"use client"

import { Plus, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useState, useTransition } from "react";
import CreateBoardDialog from "./create-board-dialog";
import { Board } from "@/lib/models/models.types";
import { setActiveBoard } from "@/lib/actions/board";

interface BoardSwitcherProps {
    boards: Board[];
}

export default function BoardSwitcher({ boards }: BoardSwitcherProps) {
    const [showAddBoardDialog, setShowAddBoardDialog] = useState(false);
    const [isPending, startTransition] = useTransition();
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Switch board
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {boards.length > 0 && boards.map((board) => (
                        <DropdownMenuItem
                            key={board._id}
                            onClick={() =>
                                startTransition(async () => {
                                    await setActiveBoard(board._id);
                                })
                            }
                        >
                            {board.name}
                            {board.isActive && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                    Active
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}
                    {boards.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem onClick={() => setShowAddBoardDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create new board
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {showAddBoardDialog && (
                <CreateBoardDialog
                    open={showAddBoardDialog}
                    onOpenChange={setShowAddBoardDialog}
                />
            )}
        </>
    );
}

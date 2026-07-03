"use client"

import { Plus, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useState } from "react";
import CreateColumnDialog from "./create-column-dialog";
import BoardSettingsDialog from "./board-settings-dialog";
import { useBoardContext } from "./board-provider";

export default function BoardMenu() {
    const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
    const [showBoardSettingsDialog, setShowBoardSettingsDialog] = useState(false);
    const { board } = useBoardContext();


    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Board menu
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAddColumnDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add column
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBoardSettingsDialog(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Board settings
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {showAddColumnDialog && (
                <CreateColumnDialog
                    boardId={board._id}
                    open={showAddColumnDialog}
                    onOpenChange={setShowAddColumnDialog}
                />
            )}
            {showBoardSettingsDialog && (
                <BoardSettingsDialog
                    board={board}
                    open={showBoardSettingsDialog}
                    onOpenChange={setShowBoardSettingsDialog}
                />
            )}
        </>
    );
}

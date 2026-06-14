"use client"

import { Plus, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useState } from "react";
import CreateBoardDialog from "./create-board-dialog";


export default function BoardSwitcher() {
    const [showAddBoardDialog, setShowAddBoardDialog] = useState(false);
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

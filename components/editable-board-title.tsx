"use client";

import { useState, useRef, useEffect } from "react";
import { updateBoardName } from "@/lib/actions/board";
import { toast } from "sonner";
import { useBoardContext } from "./board-provider";

interface EditableBoardTitleProps {
    boardId: string;
    initialName: string;
}

export default function EditableBoardTitle({ boardId, initialName }: EditableBoardTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { patchBoard } = useBoardContext();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    async function handleSave() {
        if (name.trim() === "") {
            toast.error("Board name cannot be empty");
            setName(initialName);
            return;
        }

        if (name === initialName) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateBoardName(boardId, name);

            if (result.error) {
                toast.error(result.error);
                setName(initialName);
            } else {
                patchBoard({ name: name.trim() });
                toast.success("Board name updated successfully");
            }
        } catch {
            toast.error("Failed to update board name");
            setName(initialName);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    }

    function handleCancel() {
        setName(initialName);
        setIsEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="dashboard-title w-full max-w-[min(52vw,32rem)] border-b-2 border-primary bg-transparent px-1 font-bold leading-none tracking-[-0.045em] focus:outline-none disabled:opacity-50"
                />
            </div>
        );
    }

    return (
        <h1
            onClick={() => setIsEditing(true)}
            className="dashboard-title max-w-[min(52vw,32rem)] cursor-pointer truncate font-bold leading-none tracking-[-0.045em] transition-colors hover:text-primary"
            title="Click to edit board name"
        >
            {name}
        </h1>
    );
}

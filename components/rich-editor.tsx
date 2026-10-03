"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Heading2,
    Undo2,
    Redo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function RichTextEditor({
    value = "",
    onChange,
    placeholder,
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[120px] w-full px-3 py-2",
                    "prose prose-sm max-w-none",
                    "focus:outline-none",
                    "[&_ul]:list-disc [&_ul]:pl-6",
                    "[&_ol]:list-decimal [&_ol]:pl-6",
                    "[&_a]:text-primary [&_a]:underline"
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Keep editor synchronized when the form value changes externally.
    useEffect(() => {
        if (!editor) return;

        const currentContent = editor.getHTML();

        if (value !== currentContent) {
            editor.commands.setContent(value || "", {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previousUrl || "");

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().setLink({ href: url }).run();
    };

    return (
        <div
            className={cn(
                "overflow-hidden rounded-md border bg-background",
                className
            )}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    data-active={editor.isActive("bold")}
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                <div className="mx-1 h-5 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={setLink}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>

                <div className="mx-1 h-5 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo2 className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor */}
            <div className="relative">
                {!editor.getText() && placeholder && (
                    <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
                        {placeholder}
                    </div>
                )}

                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export function RichTextDisplay({
    value,
    className,
}: {
    value?: string;
    className?: string;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Link.configure({
                openOnClick: true,
                autolink: true,
                linkOnPaste: true,
            }),
        ],
        content: value || "",
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm max-w-none break-words text-foreground",
                    "[&_ul]:list-disc [&_ul]:pl-6",
                    "[&_ol]:list-decimal [&_ol]:pl-6",
                    "[&_a]:text-primary [&_a]:underline",
                    className
                ),
            },
        },
    });

    useEffect(() => {
        if (!editor || value === editor.getHTML()) return;
        editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    if (!editor || !editor.getText().trim()) return null;

    return <EditorContent editor={editor} />;
}
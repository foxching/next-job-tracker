"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Column } from "@/lib/models/models.types";
import { useMemo } from "react";

export default function FilterModal({
    open,
    onOpenChange,
    columns,
    filters,
    setFilters,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columns: Column[];
    filters: any;
    setFilters: (next: any) => void;
}) {
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        (columns || []).forEach((col) => {
            (col.jobApplications || []).forEach((job: any) => {
                (job.tags || []).forEach((t: string) => {
                    const cleaned = t?.trim();
                    if (cleaned) tagSet.add(cleaned);
                });
            });
        });
        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }, [columns]);

    function clearFilters() {
        setFilters({ query: "", selectedColumns: [], selectedTags: [], hasSalary: "all", hasNotes: "all" });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 ">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keyword</label>
                        <Input placeholder="Enter a keyword..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
                        <p className="text-xs text-muted-foreground mt-1">Search company, position, tags, notes and more.</p>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columns</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(columns || []).map((col) => (
                                <label key={col._id} className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-sm">
                                    <input type="checkbox" checked={filters.selectedColumns.includes(col._id)} onChange={() => setFilters((c: any) => ({ ...c, selectedColumns: c.selectedColumns.includes(col._id) ? c.selectedColumns.filter((id: string) => id !== col._id) : [...c.selectedColumns, col._id] }))} />
                                    <span>{col.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {allTags.length > 0 ? allTags.map((tag) => (
                                <button key={tag} type="button" onClick={() => setFilters((c: any) => ({ ...c, selectedTags: c.selectedTags.includes(tag) ? c.selectedTags.filter((t: string) => t !== tag) : [...c.selectedTags, tag] }))} className={`rounded-full border px-2.5 py-1 text-sm ${filters.selectedTags.includes(tag) ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                                    {tag}
                                </button>
                            )) : <p className="text-sm text-muted-foreground">No tags yet.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Salary</label>
                        <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm mt-2" value={filters.hasSalary} onChange={(e) => setFilters({ ...filters, hasSalary: e.target.value })}>
                            <option value="all">Any salary</option>
                            <option value="with-salary">With salary</option>
                            <option value="without-salary">Without salary</option>
                        </select>

                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 block">Notes</label>
                        <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm mt-2" value={filters.hasNotes} onChange={(e) => setFilters({ ...filters, hasNotes: e.target.value })}>
                            <option value="all">Any notes</option>
                            <option value="with-notes">With notes</option>
                            <option value="without-notes">Without notes</option>
                        </select>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={clearFilters}>Clear</Button>
                        <Button onClick={() => onOpenChange(false)}>Apply</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

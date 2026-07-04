"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Analytics = {
    totalJobs: number;
    jobsPerColumn: Record<string, number>;
    topTags: { tag: string; count: number }[];
};

export default function InsightsTab({ boardId }: { boardId: string }) {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetch(`/api/analytics/board?boardId=${boardId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                if (data?.error) {
                    setError(data.error);
                    setAnalytics(null);
                } else if (data?.success) {
                    setAnalytics(data.data);
                    setError(null);
                } else {
                    setError("Unexpected response");
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load analytics");
            })
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, [boardId]);

    if (loading) return <div>Loading insights…</div>;

    if (error) {
        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-700">{error}</p>
                <a href="/profile" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Upgrade</a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-500">Total cards</p>
                <p className="text-2xl font-semibold">{analytics?.totalJobs ?? 0}</p>
            </div>

            <div>
                <p className="text-sm text-gray-500">Cards by column</p>
                <ul className="mt-2 space-y-1">
                    {Object.entries(analytics?.jobsPerColumn ?? {}).map(([col, count]) => (
                        <li key={col} className="text-sm text-gray-700">{col}: {count}</li>
                    ))}
                </ul>
            </div>

            <div>
                <p className="text-sm text-gray-500">Top tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {analytics?.topTags?.length ? (
                        analytics.topTags.map((t) => (
                            <span key={t.tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{t.tag} ({t.count})</span>
                        ))
                    ) : (
                        <p className="text-sm text-gray-700">No tags yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

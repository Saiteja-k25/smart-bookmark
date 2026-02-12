"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

// Type for the bookmark that gets returned after insert
type Bookmark = {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
};

// Props: onBookmarkAdded is a callback from the parent (BookmarkDashboard)
// that adds the new bookmark to the shared list immediately.
type Props = {
    onBookmarkAdded: (bookmark: Bookmark) => void;
};

export default function AddBookmark({ onBookmarkAdded }: Props) {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!url.trim() || !title.trim()) {
            setError("Please fill in both URL and Title.");
            return;
        }

        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to add a bookmark.");
            setLoading(false);
            return;
        }

        // Insert and get the inserted row back using .select()
        const { data, error: insertError } = await supabase
            .from("bookmarks")
            .insert({
                url: url.trim(),
                title: title.trim(),
                user_id: user.id,
            })
            .select()
            .single();

        if (insertError) {
            setError(insertError.message);
        } else if (data) {
            // Tell the parent about the new bookmark so it shows up instantly
            onBookmarkAdded(data);
            setUrl("");
            setTitle("");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Bookmark title (e.g., My Blog)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                    {loading ? "Adding..." : "Add Bookmark"}
                </button>
            </div>

            {error && (
                <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">
                    ⚠️ {error}
                </p>
            )}
        </form>
    );
}

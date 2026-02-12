"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import AddBookmark from "./AddBookmark";
import BookmarkList from "./BookmarkList";

// Define the shape of a bookmark object
type Bookmark = {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
};

// BookmarkDashboard:
// This component manages ALL bookmark state in one place.
// It fetches bookmarks, listens for real-time changes,
// and passes data + callbacks down to child components.
export default function BookmarkDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Function to fetch all bookmarks for the current user
    const fetchBookmarks = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setBookmarks(data);
        }
    }, []);

    useEffect(() => {
        // Check current auth state
        const init = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                await fetchBookmarks(user.id);
            }
            setLoading(false);
        };
        init();

        // Listen for login/logout events
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            if (newUser) {
                fetchBookmarks(newUser.id);
            } else {
                setBookmarks([]);
            }
        });

        // Subscribe to Realtime — this handles the cross-tab sync
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "bookmarks" },
                (payload) => {
                    const newBookmark = payload.new as Bookmark;
                    setBookmarks((current) => {
                        if (current.some((b) => b.id === newBookmark.id)) return current;
                        return [newBookmark, ...current];
                    });
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "bookmarks" },
                (payload) => {
                    const deletedId = payload.old.id;
                    setBookmarks((current) =>
                        current.filter((b) => b.id !== deletedId)
                    );
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);

    // Called by AddBookmark after a successful insert
    const handleBookmarkAdded = (newBookmark: Bookmark) => {
        setBookmarks((current) => {
            if (current.some((b) => b.id === newBookmark.id)) return current;
            return [newBookmark, ...current];
        });
    };

    // Called by BookmarkList when a bookmark is deleted
    const handleBookmarkDeleted = async (id: string) => {
        // Optimistically remove from the UI first (feels instant!)
        setBookmarks((current) => current.filter((b) => b.id !== id));

        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            // If delete failed, refetch to restore correct state
            if (user) fetchBookmarks(user.id);
            alert("Failed to delete bookmark: " + error.message);
        }
    };

    // Show a spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not logged in — show welcome screen
    if (!user) {
        return (
            <div className="text-center py-20">
                <div className="text-7xl mb-6">🔖</div>
                <h2 className="text-3xl font-bold text-white mb-3">
                    Welcome to Smart Bookmark
                </h2>
                <p className="text-gray-400 text-lg mb-2">
                    Save and organize your favorite links.
                </p>
                <p className="text-gray-500">
                    Sign in with Google to get started →
                </p>
            </div>
        );
    }

    // Logged in — show the bookmark manager
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-4">
                    ➕ Add a New Bookmark
                </h2>
                <AddBookmark onBookmarkAdded={handleBookmarkAdded} />
            </section>

            <hr className="border-gray-800" />

            <section>
                <h2 className="text-lg font-semibold text-white mb-4">
                    📚 Your Bookmarks
                </h2>
                <BookmarkList bookmarks={bookmarks} onDelete={handleBookmarkDeleted} />
            </section>
        </div>
    );
}

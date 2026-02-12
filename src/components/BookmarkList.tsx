"use client";

// Define the shape of a bookmark object
type Bookmark = {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
};

// Props: bookmarks list and delete handler come from the parent (BookmarkDashboard)
type Props = {
    bookmarks: Bookmark[];
    onDelete: (id: string) => void;
};

// BookmarkList is now a "dumb" component — it just displays
// whatever bookmarks it receives and calls onDelete when needed.
// All the data fetching and Realtime logic is in BookmarkDashboard.
export default function BookmarkList({ bookmarks, onDelete }: Props) {
    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📑</div>
                <p className="text-gray-400 text-lg">No bookmarks yet.</p>
                <p className="text-gray-500 text-sm mt-1">
                    Add your first bookmark above!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {bookmarks.map((bookmark) => (
                <div
                    key={bookmark.id}
                    className="group flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
                >
                    <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-white font-medium truncate">
                            {bookmark.title}
                        </h3>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm truncate block transition-colors"
                        >
                            {bookmark.url}
                        </a>
                        <p className="text-gray-500 text-xs mt-1">
                            {new Date(bookmark.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>

                    <button
                        onClick={() => onDelete(bookmark.id)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

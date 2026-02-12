import AuthButton from "@/components/AuthButton";
import BookmarkDashboard from "@/components/BookmarkDashboard";

// Force this page to be rendered dynamically (not at build time).
// This is needed because the page depends on Supabase (runtime env variables).
export const dynamic = "force-dynamic";

// This is the main page of our app.
// It's a Server Component by default, so it renders on the server first.
// The interactive parts (AuthButton, BookmarkDashboard) are Client Components.
export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header / Navbar */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔖</span>
            <h1 className="text-xl font-bold text-white">Smart Bookmark</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BookmarkDashboard />
      </div>
    </main>
  );
}

import Link from "next/link";

// This page is shown if something goes wrong during Google sign-in.
// The user is redirected here from /auth/callback if the code exchange fails.
export default function AuthCodeError() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">😓</div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    Authentication Error
                </h1>
                <p className="text-gray-400 mb-6">
                    Something went wrong during sign-in. Please try again.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    Go Back Home
                </Link>
            </div>
        </main>
    );
}

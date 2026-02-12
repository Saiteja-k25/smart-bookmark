import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware runs on EVERY request before it reaches your pages.
// Its job here: refresh the Supabase auth session (so the user stays logged in).
export async function middleware(request: NextRequest) {
    // Create a response object that we can modify
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Create a Supabase client specifically for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update cookies on the request (for downstream code)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Also update cookies on the response (sent back to browser)
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This is the key line — it refreshes the user's session
    // IMPORTANT: Do NOT remove this line. Without it, sessions will expire.
    await supabase.auth.getUser();

    return supabaseResponse;
}

// Tell Next.js which routes this middleware should run on
// This runs on all routes EXCEPT static files and images
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

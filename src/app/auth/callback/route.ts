import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This route handles the OAuth callback from Google.
// After the user signs in with Google, Supabase redirects them here
// with a "code" in the URL. We exchange that code for a session.
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        // Exchange the temporary code for a full user session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Success! Send the user back to the home page
            return NextResponse.redirect(origin);
        }
    }

    // If something went wrong, redirect to an error page
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

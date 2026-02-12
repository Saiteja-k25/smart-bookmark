# 🔖 Smart Bookmark — Save & Organize Your Links

A simple, real-time bookmark manager built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

Users sign in with **Google**, save bookmarks (URL + title), and see live updates across tabs — no page refresh needed.



## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Google Sign-In | One-click login via Google OAuth — no email/password |
| ➕ Add Bookmarks | Save any URL with a custom title |
| 🗑️ Delete Bookmarks | Remove bookmarks you no longer need |
| 🔒 Private | Each user only sees their own bookmarks |
| ⚡ Real-time Sync | Open 2 tabs — add a bookmark in one, it appears in the other instantly |
| 🌙 Dark Mode UI | Modern, clean dark theme |

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router) — React framework with server-side rendering
- **Supabase** — Backend-as-a-Service for Auth, Database (PostgreSQL), and Realtime
- **Tailwind CSS** — Utility-first CSS framework for rapid styling
- **TypeScript** — Type-safe JavaScript
- **Vercel** — Deployment platform

---

## 📁 Project Structure

```
smart-bookmark/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # OAuth callback handler
│   │   │   └── auth-code-error/
│   │   │       └── page.tsx          # Error page for failed sign-in
│   │   ├── globals.css               # Global styles (dark theme)
│   │   ├── layout.tsx                # Root layout with metadata
│   │   └── page.tsx                  # Main page
│   ├── components/
│   │   ├── AuthButton.tsx            # Google sign-in/out button
│   │   ├── AddBookmark.tsx           # Form to add new bookmarks
│   │   ├── BookmarkList.tsx          # Displays bookmarks with realtime
│   │   └── BookmarkDashboard.tsx     # Conditional auth-based view
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Browser-side Supabase client
│   │       └── server.ts             # Server-side Supabase client
│   └── middleware.ts                 # Refreshes auth session on every request
├── .env.local                        # Supabase credentials (not committed)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google Cloud Console](https://console.cloud.google.com) project for OAuth credentials

### Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd smart-bookmark
npm install
```

### Step 2: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Give it a name (e.g., "smart-bookmark") and set a database password
3. Wait for the project to be ready (~2 minutes)

### Step 3: Set Up the Database

Go to **SQL Editor** in your Supabase dashboard and run this:

```sql
-- Create the bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (so users only see their own data)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 4: Enable Realtime

1. In Supabase Dashboard → **Database** → **Replication**
2. Find the `bookmarks` table and **enable Realtime** for it

### Step 5: Set Up Google OAuth

#### In Google Cloud Console:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URI**:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   (Find your project ref in Supabase → Settings → General)
7. Copy the **Client ID** and **Client Secret**

#### In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your **Client ID** and **Client Secret**
4. Save

### Step 6: Configure Environment Variables

Copy your Supabase credentials into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase → **Settings** → **API**.

### Step 7: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Smart Bookmark app!

---

## 🌐 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**
5. Once deployed, add your Vercel URL to Google OAuth redirect URIs:
   ```
   https://your-app.vercel.app/auth/callback
   ```
   And also add it in Supabase → **Authentication** → **URL Configuration** → **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

---

## 🐛 Problems Faced & How I Solved Them

### Problem 1: "npm naming restrictions" error during project setup
**Error:** `Could not create a project called "Smart Book mark" because of npm naming restrictions`
**Cause:** The parent folder name had spaces and capital letters, which npm doesn't allow.
**Solution:** Created the project inside a subfolder named `smart-bookmark` (lowercase, hyphen instead of spaces).

### Problem 2: Understanding Server Components vs Client Components
**Problem:** Next.js App Router uses Server Components by default. But interactive features (forms, buttons, real-time subscriptions) need Client Components.
**Solution:** Added `"use client"` at the top of components that need interactivity (AuthButton, AddBookmark, BookmarkList, BookmarkDashboard). The main `page.tsx` stays as a Server Component and just imports the Client Components.

### Problem 3: Supabase Auth session not persisting across pages
**Problem:** After logging in via Google, the session would sometimes disappear on page reload.
**Solution:** Created a `middleware.ts` file that runs on every request and calls `supabase.auth.getUser()` to refresh the session. This ensures cookies stay valid.

### Problem 4: Real-time updates showing duplicate bookmarks
**Problem:** When adding a bookmark, it would sometimes appear twice — once from the local insert response and once from the Realtime subscription.
**Solution:** In the Realtime listener's INSERT handler, added a duplicate check: `if (current.some((b) => b.id === newBookmark.id)) return current;` — so if the bookmark is already in the list, we skip adding it again.

### Problem 5: Cookies error in Server Components
**Problem:** The `setAll` method in the server Supabase client throws an error when called from a Server Component (because Server Components can't set cookies).
**Solution:** Wrapped the cookie-setting code in a try-catch block. The error is harmless because the middleware handles session refresh anyway.

### Problem 6: Google OAuth redirect URI mismatch
**Problem:** Google sign-in fails if the redirect URI in Google Cloud Console doesn't exactly match what Supabase expects.
**Solution:** Make sure the redirect URI is exactly: `https://<project-ref>.supabase.co/auth/v1/callback`. For Vercel deployment, also add the Vercel URL to Supabase's redirect URLs.

---

## 📖 Full Project Explanation

### How Authentication Works

1. **User clicks "Sign in with Google"** → The `AuthButton` component calls `supabase.auth.signInWithOAuth()` which redirects to Google's sign-in page.
2. **Google authenticates the user** and redirects back to Supabase's callback URL.
3. **Supabase creates a session** and redirects the user to our app's `/auth/callback` route.
4. **Our callback route** (`/auth/callback/route.ts`) exchanges the temporary code for a full session using `supabase.auth.exchangeCodeForSession()`.
5. **The middleware** (`middleware.ts`) refreshes this session on every subsequent request, so the user stays logged in.

### How Bookmarks Work

1. **Adding:** The `AddBookmark` component takes a URL and title, gets the current user's ID, and inserts a row into the `bookmarks` table via `supabase.from("bookmarks").insert(...)`.
2. **Displaying:** The `BookmarkList` component queries `supabase.from("bookmarks").select("*").eq("user_id", user.id)` to get only the current user's bookmarks.
3. **Deleting:** Each bookmark has a delete button that calls `supabase.from("bookmarks").delete().eq("id", id)`.

### How Real-time Sync Works

This is the coolest part! The `BookmarkList` component subscribes to Supabase Realtime:

```typescript
supabase
  .channel("bookmarks-realtime")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookmarks" }, (payload) => {
    // Add new bookmark to state
  })
  .on("postgres_changes", { event: "DELETE", schema: "public", table: "bookmarks" }, (payload) => {
    // Remove bookmark from state
  })
  .subscribe();
```

When any change happens in the `bookmarks` table (INSERT or DELETE), Supabase pushes the change to all connected clients via WebSockets. This means if you have two tabs open and add a bookmark in one, the other tab receives the event and updates its list instantly — **no page refresh needed!**

### How Row Level Security (RLS) Works

RLS is Supabase's way of ensuring data privacy at the database level:

- **SELECT policy:** `auth.uid() = user_id` — You can only fetch rows where `user_id` matches your login.
- **INSERT policy:** `auth.uid() = user_id` — You can only insert rows with your own `user_id`.
- **DELETE policy:** `auth.uid() = user_id` — You can only delete your own rows.

Even if someone tries to use the Supabase API directly, they can only access their own data. **Security is enforced at the database level**, not just in the app code.

### How the Middleware Works

Next.js middleware runs before every request. Ours does one thing: refreshes the Supabase session. Without it, the auth cookies would expire and the user would get randomly logged out. It uses the same `@supabase/ssr` package to read/write cookies.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

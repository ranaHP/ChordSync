# ChordSync

ChordSync is a production-ready full-stack Next.js App Router application for live guitar and singing sessions. Groups can build shared queues, enter a dark fullscreen chord view, request a single controller, and sync scroll position in real time through Pusher without a separate backend server.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion
- MongoDB + Mongoose models
- Auth.js/NextAuth with Google OAuth and MongoDB persistence
- Pusher realtime events using Next.js API routes
- React Hot Toast for UX feedback

## Features

- Google login/register with MongoDB user profiles
- Group creation, owner/admin/member roles, member search by email/name
- Song library with search and filters-ready API fields
- Shared group queue with current/upcoming states and admin/controller controls
- Fullscreen stage UI with large chord typography
- Request-control flow with one active controller
- Scroll percentage broadcast from controller to other performers
- One-minute ending countdown with split-screen next-song preview
- Seed script with 20 original dummy songs across Sinhala, English, and Hindi-style entries

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
MONGODB_URI=mongodb://127.0.0.1:27017/chordsync
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
```

4. Seed songs:

```bash
npm run seed
```

5. Run development server:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Routes

- `/login` — Google sign-in
- `/dashboard` — authenticated landing dashboard
- `/groups` — create and browse groups
- `/groups/[groupId]` — members, queue, now playing, song search
- `/groups/[groupId]/session` — fullscreen live chord stage
- `/songs` — song library
- `/api/auth/[...nextauth]` — Auth.js route handler
- `/api/groups`, `/api/groups/[groupId]/members`, `/api/groups/[groupId]/queue`, `/api/groups/[groupId]/session`, `/api/songs` — API routes

## Production notes

- Pusher is used because serverless Next.js deployments do not reliably host Socket.IO websocket servers inside API routes. This keeps the app inside Next.js with no Express backend.
- Non-controller clients receive scroll events and are pointer-disabled in fullscreen mode until they get control.
- The example songs are intentionally original placeholders and not copied lyrics.

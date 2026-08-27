# QuBrains

A real-time messaging platform — private one-to-one chat, presence,
connection requests, and privacy controls. Built with React, Vite, Tailwind CSS
v4, and Firebase.

This started as a quantum-key-distribution demo with plaintext passwords
stored directly in the database. It's been rebuilt from the ground up,
phase by phase, into the app described below.

## Status: core messaging release

The status/update feature and chat file-sending feature have been removed. The
remaining app keeps authentication, presence, one-to-one text chat, connection
requests, notifications, profile management, settings, and responsive layouts.
The connection-acceptance flow was also fixed so the request is accepted before
the connection index is written, allowing the database rules to verify the
accepted request correctly.

## Features

- **Auth**: Firebase Authentication (email/password), session persistence,
  password change with re-authentication
- **Presence**: real-time online/offline with correct reconnect handling,
  privacy-aware last-seen
- **Chat**: one-to-one real-time messaging, delivered/seen receipts,
  typing indicators, paginated history (loads recent messages, fetches
  earlier ones on scroll-up rather than downloading entire conversations)
- **Notifications**: a real feed (message/request/system), with inline
  accept/decline for connection requests
- **Connections**: send/accept/decline requests from a chat header
- **Privacy**: online status and last-seen controls enforced by database rules
- **Profile**: editable display name/bio, profile picture via gallery or
  camera
- **Settings**: password change, System/Light/Dark theme, privacy controls
- **Responsive**: distinct mobile (bottom nav) and desktop (sidebar)
  layouts, not one layout squeezed to fit both

## Technology stack

- React 19 + Vite
- Tailwind CSS v4 (CSS-first config — see `src/index.css`)
- Framer Motion, `lucide-react`
- `react-router-dom`
- Firebase Authentication, Realtime Database, Storage

## Architecture

```
src/
├── components/
│   ├── auth/          Login, Register, shared AuthLayout
│   ├── home/           AppShell (layout + nav), Home, OnlineUsers
│   ├── chat/            ChatList, ChatWindow, message rendering
│   ├── notifications/   Notification feed
│   ├── profile/         Profile view/edit, picture upload
│   ├── settings/        Account/Appearance/Privacy settings
│   └── common/           Avatar, Loader, ErrorMessage, CameraCapture, route guards
├── services/            All Firebase reads/writes — no component talks to
│                         Firebase directly. auth, users, presence, chats,
│                         storage, notifications, requests, settings
├── context/              AuthContext (single onAuthStateChanged listener),
│                         ThemeContext
├── hooks/                Thin wrappers around services for components:
│                         useAuth, usePresence, useChats, useMessages,
│                         useNotifications, useProfiles, useUserProfile, useTheme
├── firebase/              SDK instance bindings (config, auth, database, storage)
└── utils/                validation, formatTime, formatBytes,
                          firebaseErrors
```

Most Firebase mutations live in `services/`; a small number of read-only
subscriptions remain in hooks/components where the data is tightly coupled
to the UI. Security is enforced by Firebase rules rather than by this
architectural convention.

## Firebase setup

1. **Enable Email/Password sign-in** — Firebase Console → Authentication →
   Sign-in method.
2. **Deploy the security rules**:
   - Realtime Database: paste `database.rules.json` into Console → Realtime
     Database → Rules, or `firebase deploy --only database`.
   - Storage: paste `storage.rules` into Console → Storage → Rules, or
     `firebase deploy --only storage`.
   - Without these, every read and write is denied by default.
3. Confirm **Realtime Database** and **Storage** are provisioned (this app
   uses Realtime Database, not Firestore).

## Authentication setup

Handled entirely by Firebase Auth (`src/services/auth.js`,
`src/firebase/auth.js`) — no custom logic, no password ever touches
Realtime Database, Storage, localStorage, or app state. "Remember me" on
login maps to `browserLocalPersistence` vs `browserSessionPersistence`,
not a manually-stored flag.

## Storage setup

Only profile pictures use Firebase Storage. Uploads are limited to 5 MB and
images are enforced by `storage.rules`. Chat file uploads and status media are
not part of this release.

| Folder | Limit | Type check |
|---|---|---|
| `profilePictures/{uid}/` | 5 MB | image |

## Environment variables

Copy `.env.example` to `.env` and fill in your Firebase project's web
config (Console → Project settings → General → Your apps):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

A `.env` pre-filled with this project's original values is included for
local development and is gitignored — replace it if you're pointing this
at a different Firebase project.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run lint
```

Before packaging this release, the modified source was checked for missing
relative imports, the database rules were checked for valid JSON structure,
and the modified plain JavaScript files passed Node syntax checks. A full
Vite build/lint still requires installing the project dependencies locally.

## Deployment

Standard Vite static build (`npm run build` → `dist/`), deployable to
Firebase Hosting, Vercel, Netlify, or any static host. Remember the
Firebase setup steps above are separate from hosting — the app won't
function on any host until Email/Password auth is enabled and the rules
are deployed.

## Security

- Passwords never touch Realtime Database, Storage, localStorage, or app
  state — Firebase Authentication owns them entirely.
- Realtime Database rules deny by default; every readable/writable path is
  explicit. See inline comments in `database.rules.json` for the
  reasoning behind the less-obvious ones — in particular:
  - `presence/{uid}/lastSeen` has its own field-level rule, separate from
    the rest of the user's data, because RTD read rules only ever grant
    permissively down the tree — a broad "any signed-in user can read this
    profile" rule (needed for chat lists, search) would make it impossible
    to later restrict just that one field for a 3-tier privacy setting.
  - `usernames/`, `userConversations/`, and `userConnections/` are
    denormalized indexes not in the original schema sketch — added
    because Realtime Database can't efficiently query "does this map
    contain key X" (participants, connections) or enforce uniqueness
    (usernames) any other way at this scale.
  - Text message content and sender/receiver identity are locked after
    creation — only `delivered`/`seen` may change — so a participant can't
    rewrite history in a conversation they're part of.
- Storage rules gate writes by auth, content type (where checkable), and
  size, with `create`/`update` split from `delete` — a combined rule would
  reject every delete, since `request.resource` is null on a delete and
  any content-type check on it throws.
- Chat message writes are scoped to conversation participants, message
  creation is sender-only, and existing message content fields are immutable;
  deletion of messages is denied by the database rules.
- Connection requests can only be created by the requester, accepted by the
  recipient, or deleted by either participant; a requester can no longer
  self-accept a request by writing directly to the database.
- **Known, documented gaps rather than oversights:**
  - Chat documents/zip files aren't content-type-restricted server-side
    (too many valid MIME types for office formats to enumerate cleanly in
    the rules language) — only size-limited. Client-side extension
    validation is the first line of defense; this isn't a public CDN, it's
    files shared inside an authenticated, already-mutually-trusting chat.
  - "Delivered" can't fire while a recipient is away from the app — there's
    no push infrastructure — so delivered and seen both land together,
    when the recipient actually opens the conversation.

## Future improvements

Deliberately out of scope, not overlooked:

- **Username changes** — locked immutable after registration. Supporting
  renames means atomically repointing the `usernames/` index *and*
  relaxing its immutability rule safely; not requested, and the added
  attack surface wasn't worth it unprompted.
- **Cloud Functions generally** — signed URLs, server-side fan-out
  notifications for "someone you follow posted," scheduled cleanup — all
  would strengthen this app but need a paid Firebase plan and a
  server-side deploy target neither specified nor available here.

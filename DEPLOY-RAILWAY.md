# Deploying NetraNews on Railway (single service)

The repo now builds as **one** service: the Spring Boot backend serves both the
website and the `/api` endpoints from the same URL. This removes the old
`localhost:8080` problem — the front-end talks to its own origin when deployed.

## 1. Deploy the app

1. In Railway: **New Project → Deploy from GitHub repo** → pick this repo.
2. Railway detects the root **`Dockerfile`** and builds it (Maven → jar → run).
   - If Railway picked something else, set **Settings → Build → Builder = Dockerfile**.
3. Wait for the build to finish and open the generated `*.up.railway.app` URL.

## 2. Add a database (MongoDB)

The app needs MongoDB. Two options:

- **Railway plugin:** New → Database → **MongoDB**. Copy its connection string.
- **MongoDB Atlas (free):** create a cluster, get the `mongodb+srv://...` URI.

## 3. Set environment variables (Service → Variables)

These are **not** in the repo (`.env.local` is gitignored), so you must add them:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | your Mongo connection string (Atlas or Railway plugin) |
| `LLM_API_KEY` | your Groq key (`gsk_...`) — get one at https://console.groq.com/keys |
| `ADMIN_EMAIL` | e.g. `admin@netranews.local` |
| `ADMIN_PASSWORD` | a password you choose |

`PORT` is injected by Railway automatically — don't set it.
`CORS_ORIGINS` is not needed (site and API share one origin).

## 4. Redeploy & verify

After setting variables, redeploy. Then on the live URL:

- News loads from the backend.
- AI summary / translation / NetraBot return real output (Groq key present).
- Navbar language switch translates the whole page.
- Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` → admin dashboard works; normal
  users get **403** on create/edit/delete.

## Local development (unchanged)

- Backend: `cd backend && ./run.sh` (loads `.env.local`) → http://localhost:8080
- The site is also served at http://localhost:8080 by the backend jar, or you can
  still run the front-end on a separate static port (5500) during development.

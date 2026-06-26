# NetraNews

A responsive, Hindi-language news website with an AI assistant. The front-end is a dependency-free single-page app; the backend is a Spring Boot + MongoDB REST API with an OpenAI-compatible LLM integration (Groq by default) for summaries, translation, and a grounded news chatbot.

## Prerequisites

- **Java 8+** (the project targets Java 8; it builds and runs fine on newer JDKs such as 17/21)
- **MongoDB** running locally, or a MongoDB Atlas connection string
- Python 3 (optional) or any static file server for the front-end
- Git

Maven is **not** required — the repo ships the Maven wrapper (`mvnw` / `mvnw.cmd`), which downloads the correct Maven version automatically.

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env.local        # then open .env.local and paste your Groq API key
./run.sh                          # macOS/Linux/Git Bash
#   run.cmd                       # Windows cmd/PowerShell
```

`run.sh` / `run.cmd` load `.env.local` and start the API on `http://localhost:8080`.

- No API key? The app still runs — AI features fall back to built-in Hindi/English responses.
- No `.env.local`? You can also run `./mvnw spring-boot:run` directly and set env vars yourself.

### 2. Front-end

Serve the project root with any static server (use a port other than 8080 so it doesn't clash with the backend):

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`. The backend's CORS config allows any `localhost`/`127.0.0.1` port, so any static-server port works.

The front-end auto-detects the API at `http://localhost:8080`. It also merges in local mock articles and offline AI fallbacks, so it remains usable even if the backend is down.

## Configuration

Backend config is in `backend/src/main/resources/application.yml` and is driven entirely by environment variables. Set them in `backend/.env.local` (see `backend/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLM_API_KEY` | _(empty)_ | API key for live AI. Empty → offline fallbacks. |
| `LLM_BASE_URL` | `https://api.groq.com/openai/v1` | OpenAI-compatible endpoint. |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | Model id (must match the provider). |
| `MONGODB_URI` | `mongodb://localhost:27017/netradb` | Mongo connection; set an Atlas URI for the cloud. |
| `PORT` | `8080` | API port. |
| `CORS_ORIGINS` | `localhost:3000,5500,8080` | Extra allowed front-end origins. Any `localhost`/`127.0.0.1` port is allowed automatically, so you rarely need to set this. |
| `ADMIN_EMAIL` | _(empty)_ | Email of the admin account. Set with `ADMIN_PASSWORD` to enable the admin dashboard. |
| `ADMIN_PASSWORD` | _(empty)_ | Password for the admin account. Both empty → no admin seeding. |

`.env.local` is gitignored — **never commit real keys.**

### Admin dashboard

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`. On startup the backend creates that account (or promotes an existing user) to role `ADMIN`. Log in with those credentials to access the admin dashboard, where you can add, edit, and delete articles. Without both vars, admin seeding is skipped.

### Choosing an AI provider

The backend talks to any OpenAI-compatible `/chat/completions` API, so you can switch providers by changing two env vars:

| Provider | `LLM_BASE_URL` | Notes |
| --- | --- | --- |
| **Groq** (default) | `https://api.groq.com/openai/v1` | Free key at [console.groq.com](https://console.groq.com/keys); fast, good Hindi. |
| OpenRouter | `https://openrouter.ai/api/v1` | One key, many free models. |
| Mistral | `https://api.mistral.ai/v1` | Free tier. |
| Ollama (local) | `http://localhost:11434/v1` | Offline, no key; set `LLM_MODEL` to a pulled model. |

## API endpoints

News:
- `GET /api/news`, `GET /api/news?category=खेल`, `GET /api/news?q=IPL`
- `GET /api/news/{id}`, `GET /api/news/count`
- `GET /api/news/feed/{email}` — interest-ranked stories
- `POST /api/news`, `POST /api/news/bulk`, `PUT /api/news/{id}`, `DELETE /api/news/{id}`

Auth & profile:
- `POST /api/auth/register`, `POST /api/auth/login`
- `PUT /api/auth/users/{email}/interests`

Interactions:
- `GET/POST/DELETE /api/bookmarks/{email}[/{newsId}]`
- `GET/POST /api/news/{newsId}/comments`

AI:
- `POST /api/ai/summarize` — body `{articleId?, content?, language}` → `{summary, keyPoints[]}`
- `POST /api/ai/chat` — body `{message, language}` → `{answer}`
- `GET /api/ai/translate/{id}/{language}` → `{title, summary, content}`

`backend/postman/` contains a Postman collection and `sample-articles.json` you can POST to `/api/news/bulk` to seed data.

## Front-end features

- Responsive homepage, category/search listings, and article pages
- Interest-based feed ranking, bookmarks, and comments
- Whole-page UI in 4 languages (Hindi, English, French, Spanish) via a language switcher
- AI summary, per-article translation, and a hybrid news chatbot (netrabot) that prefers NetraNews articles but falls back to general knowledge when they don't cover the question
- Role-gated admin dashboard for article CRUD (visible only to `ADMIN` users)
- Browser text-to-speech, breaking-news strip, mobile drawer, and search panel

Front-end auth is a `localStorage`-based demo (it falls back to local accounts when the backend is offline). Production auth should use Spring Security, BCrypt (already used for password hashing), and short-lived JWTs rather than client-side identity.

## Build & test

```bash
cd backend
./mvnw package        # builds target/netranews-api-1.0.0.jar
./mvnw test           # runs tests
java -jar target/netranews-api-1.0.0.jar   # run the packaged jar
```

## Project layout

```
backend/   Spring Boot API (controllers, services, repositories, models)
assets/    Front-end JS and CSS (app.js is the core SPA)
index.html Front-end entry point
```

## Security notes

- All LLM calls go through the backend; never expose `LLM_API_KEY` in browser code.
- Keep secrets in `.env.local` (gitignored), not in `application.yml` or commits.
- Put the front-end and backend behind a reverse proxy in production, forwarding `/api/*` to the API so hash-based routes stay deep-link-safe.

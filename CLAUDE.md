# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NetraNews is a Hindi-language news website. It has two independent halves:

- **Front-end** (`index.html` + `assets/`): a dependency-free, hash-routed single-page app written in vanilla JS/CSS. No build step.
- **Backend** (`backend/`): a Spring Boot 2.7 / Java 8 REST API backed by MongoDB, with an OpenAI-compatible LLM integration (default: Groq) for AI summary/chat/translation.

The two communicate over `/api/*`. The front-end degrades gracefully to local mock data and offline AI fallbacks when the backend or `LLM_API_KEY` is unavailable, so it runs standalone by opening `index.html`.

## Commands

Backend (run from `backend/`):

```bash
./run.sh                       # recommended: loads .env.local, then runs the API on :8080
./mvnw spring-boot:run         # run without loading .env.local (set LLM_API_KEY in the env yourself)
./mvnw package                 # build target/netranews-api-1.0.0.jar
./mvnw test                    # run tests
./mvnw -Dtest=ClassName#method test   # run a single test
```

Use the bundled Maven wrapper (`./mvnw`, or `mvnw.cmd` on Windows cmd/PowerShell) — it self-downloads Maven 3.9.9, so no system Maven is required. Plain `mvn` also works if installed.

**Clone-and-go config:** copy `backend/.env.example` to `backend/.env.local`, paste a Groq key into `LLM_API_KEY`, then run `./run.sh` (or `run.cmd` on Windows). `run.sh`/`run.cmd` load `.env.local` into the environment before launching. `.env.local` is gitignored — never commit real keys. Without a key the app still runs using offline AI fallbacks. To set the key ad-hoc instead, export it first: `export LLM_API_KEY=...` (Git Bash) or `$env:LLM_API_KEY="..."` (PowerShell).

Front-end (no build):

```bash
python -m http.server 8080   # or any static server; then open the page
```

Note the port collision: both the static server and Spring Boot default to 8080. Serve the front-end on a different port (e.g. 5500 — the Live Server default, which the CORS config allows) and point the API at :8080. The front-end resolves its API origin as: same origin if served on port 8080, otherwise hardcoded `http://localhost:8080` (`assets/js/app.js`, `API_ORIGIN`).

`run_requests.ps1` / `run_requests_ascii.ps1` are manual smoke-test scripts that POST sample payloads to the AI endpoints.

## Backend architecture

Standard Spring layered structure under `com.netranews`: `controller` → `service` → `repository` (Spring Data MongoDB) → `model`. Cross-cutting pieces:

- **`dto/ApiDtos.java`** — all request/response DTOs are nested static classes in this one file (`Register`, `Login`, `AuthResponse`, `AiRequest`, `SummaryResponse`, `ChatResponse`, etc.).
- **`error/ApiExceptionHandler.java`** — global `@RestControllerAdvice` that maps exceptions to HTTP status + a JSON `{timestamp, status, error}` body. Throw these from services to control responses: `NoSuchElementException` → 404, `IllegalArgumentException` → 400, `IllegalStateException` → 503.
- **`AiService`** — calls an OpenAI-compatible `/chat/completions` endpoint via `RestTemplate` (`generate()`), configured by `llm.base-url` / `llm.model` / `llm.api-key`. Default provider is **Groq** (`api.groq.com/openai/v1`, `llama-3.3-70b-versatile`); the same code path works for OpenRouter, Mistral, Ollama, LM Studio, etc. by changing those env vars. **Every AI method has a language-aware (hi/en) offline fallback** used when `apiKey` is empty or the call throws. Preserve this fallback pattern when editing AI code — the app must work without a key.
- **`NewsService.personalized`** — interest-based feed ranking via a stable sort that floats articles whose `category` is in the user's interests to the top, keeping chronological order within each group.

Code style note: backend files are written very densely (multiple statements per line, minimal whitespace). Match the surrounding style when editing.

### Key endpoint paths (note inconsistencies)

- News CRUD + `/api/news/bulk` (seed many), `/api/news/feed/{email}`, `/api/news/count`.
- Auth: `/api/auth/register`, `/api/auth/login`, `PUT /api/auth/users/{email}/interests`.
- Interactions: `/api/bookmarks/{email}[/{newsId}]`, `/api/news/{newsId}/comments`.
- AI: `POST /api/ai/summarize`, `POST /api/ai/chat`, `GET /api/ai/translate/{id}/{language}`.

The README documents some of these with older/different paths (e.g. `/api/ai/summary`, `/api/news/{id}/translate`) — trust the controllers, not the README.

### CORS — two overlapping configs

Both `config/CorsConfig.java` (hardcoded `http://localhost:5500`, mapping `/**`) and `config/WebConfig.java` (env-driven `app.cors-origins`, mapping `/api/**`) are active `@Configuration` classes. When changing allowed origins, update the relevant one (or consolidate) — overlapping mappings can produce confusing behavior.

## Front-end architecture

- **`assets/js/app.js`** — the core SPA: hash router (`route()`), all view renderers (`home`, `article`, `listing`, `profile`, `admin`), the `API` fetch wrapper (3s timeout via `AbortController`), and `state` persisted to `localStorage` (`nn_user`, `nn_bookmarks`, `nn_interests`, `nn_language`).
- **`assets/js/data.js`** — `CATEGORIES` and the `ARTICLES` mock array (Hindi content). Used as the standalone data source and merged with backend results.
- **`assets/js/news.js`, `article.js`** — additional view/feature logic.
- Remote and local articles are merged (`mergeArticles`) so the UI stays populated even if the API returns nothing. Article IDs are coerced to strings throughout for cross-source consistency.

UI text, categories, and content are Hindi (Devanagari). Auth in the front-end is a `localStorage` mock — production auth (Spring Security, JWT) is described in the README but not implemented.

## Configuration

`backend/src/main/resources/application.yml` reads env vars: `PORT` (8080), `MONGODB_URI` (defaults to local `mongodb://localhost:27017/netradb`), `LLM_BASE_URL` (`https://api.groq.com/openai/v1`), `LLM_API_KEY` (empty default → offline fallbacks), `LLM_MODEL` (`llama-3.3-70b-versatile`), `CORS_ORIGINS`. Set `MONGODB_URI` to an Atlas connection string to use the cloud cluster instead of local Mongo.

**Live AI is enabled via Groq.** A Groq API key is supplied at runtime through the `LLM_API_KEY` env var (never hardcoded in `application.yml` or committed). With the key set, the AI endpoints return real Llama 3.3 70B output; without it they fall back to templated Hindi/English text. The standard way to provide it is `backend/.env.local` (copied from `.env.example`) loaded by `./run.sh` / `run.cmd` — see the Commands section. Get a key at https://console.groq.com/keys.

## Gotchas

- Never expose `LLM_API_KEY` client-side — all LLM calls go through the backend.
- `backend/target/` is committed (compiled `.class` files and the jar); rebuild rather than trusting stale artifacts.
- `application.yml` defaults Mongo to `localhost:27017`; the backend fails fast at startup with a connection timeout if no Mongo is reachable and no valid `MONGODB_URI` is set. Make sure a local MongoDB service is running (Windows: `net start MongoDB`) or supply an Atlas URI.

# NetraNews Front-End Template

A responsive, dependency-free news website UI based on the supplied NetraNews PRD and authentication specification.

## Prerequisites

- Java 8 (1.8) and Maven 3.6+ to run the backend
- Python 3 (optional) to serve the front-end locally, or any static file server
- Git for source control

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server. Example (Python):

```powershell
python -m http.server 8080
```

Visit `http://localhost:8080`.

Notes:
- The example serves the front-end on port 8080; Spring Boot also defaults to 8080 — run the backend on a different port, or configure a proxy.
- PowerShell example for setting env vars uses `$env:NAME = "value"`; on Bash use `export NAME=value`.

## Included flows

- Responsive homepage, category/search listings, and article details
- Mobile drawer, search panel, breaking-news strip, footer, and newsletter
- Mock login using `localStorage`, profile interests, bookmarks, and comments
- Browser text-to-speech, AI summary, translation control, and news chatbot UI
- Interest-based feed ranking stored locally for the front-end demo
- Admin dashboard template for articles, categories, and user management

## Backend integration

Replace the mock data in `assets/js/data.js` and local state in `assets/js/app.js` with the Spring Boot endpoints described in the project documents. The UI expects the following endpoints (examples):

- `POST /api/ai/summary`
- `POST /api/ai/chat`
- `GET /api/news/{id}/translate?language=en`

Implement these endpoints server-side and call Google AI Studio/Gemini from the server — never expose `GEMINI_API_KEY` in browser JavaScript. Store articles and user interests in MongoDB and build grounded chatbot prompts on the server so the client only receives final responses.

Security note: production authentication should use Spring Security, BCrypt password hashing, short-lived JWTs (with refresh-token rotation), and secure HttpOnly cookies rather than storing identity in `localStorage`.

## Spring Boot backend

The complete API project is in the `backend/` directory. It targets Spring Boot 2.7 and uses MongoDB repositories, a service layer, validation, centralized error handling, and configurable CORS.

Run locally (PowerShell):

```powershell
cd backend
$env:GEMINI_API_KEY="your-google-ai-studio-key"
mvn spring-boot:run
```

Common routes:

- `GET /api/news`, `GET /api/news/{id}`, `GET /api/news?category=खेल`, `GET /api/news?q=IPL`
- `GET /api/news/feed/{email}` (preference-ranked stories)
- `POST /api/auth/register`, `POST /api/auth/login`
- `PUT /api/auth/users/{email}/interests`
- CRUD routes under `/api/news` for editorial tooling
- Bookmark and comment routes under `/api/bookmarks` and `/api/news/{id}/comments`
- `POST /api/ai/summary`, `POST /api/ai/chat`, `GET /api/news/{id}/translate`

Environment variables (examples):

- `MONGODB_URI` — MongoDB connection string, e.g. `mongodb://user:pass@host:27017/netranews`
- `GEMINI_API_KEY` — Google AI Studio key (keep secret, set on server)
- `GEMINI_MODEL` — recommended model id (e.g. `models/gpt-4o-mini` or your deployed name)
- `CORS_ORIGINS` — allowed origins for cross-origin requests

Deployment note: Put front-end and backend behind a reverse proxy and forward `/api/*` to the Spring Boot app so hash-based routes remain deep-link-safe.

## Contributing

Contributions welcome. Please add a short `CONTRIBUTING.md` with commit guidelines and open a PR for non-trivial changes.

## License

Add a `LICENSE` file to indicate project licensing (for example, MIT).

---

If you want, I can add the `CONTRIBUTING.md` and `LICENSE` files now, and update `README.md` further with specific env examples or ports. Tell me which license you prefer.

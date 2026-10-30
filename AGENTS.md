# Repository notes

## What this repo contains

Only the **frontend** of Kotlin IR Explorer: a Vite + React (JSX) single-page app in `src/`.
It renders a Monaco Kotlin editor and a Mermaid graph of the Kotlin IR.

## Non-obvious setup facts

- The UI calls `POST /api/kotlinToMermaid?withOffsetComment=true` on **its own origin** and
  expects `{ mermaidGraph, messages }` back. That backend (Kotlin / Ktor, in the upstream
  `yairm210/kotlin-ir-explorer` project) is **not part of this repository**.
- `docker-compose.base44.yml` therefore runs that backend as the published upstream image
  (`yairm210/kotlin-ir-explorer`) behind an internal-only `api` service, and runs the
  frontend from the bind-mounted source on host port 3000.
- `vite.config.mjs` proxies `/api` to `KOTLIN_IR_API_URL` (default `http://localhost:8080`).
  Compose sets it to `http://api:8080`, so the browser still uses a same-origin URL and no
  CORS configuration is needed. This is a dev-server-only setting; production builds of this
  app are served *by* the Ktor backend, which answers `/api` itself.
- `npm ci` runs on container start (lockfile is committed, `node_modules` lives in a named
  volume), so dependency changes need a container restart, not a rebuild.
- There is no database, no migration step, and no external credentials.

## Verify it works

1. `docker compose -f docker-compose.base44.yml up -d`, then `docker compose ps` — both
   `api` and `web` must report `healthy`.
2. `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200`.
3. End-to-end proof that the backend is wired up (the graph must come back as JSON):
   `curl -s -X POST -H 'Content-Type: text/plain' --data 'fun main() { val x = 5 }' 'http://localhost:3000/api/kotlinToMermaid?withOffsetComment=true'`
4. In the browser: the editor shows the example code, and the right pane draws an IR graph
   with ~20 nodes. An error box saying "Failed to generate graph" means the `api` service is
   down or unreachable — check `docker compose logs api`.

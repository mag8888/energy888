Energy of Money — 1game (Standalone SSR)

Overview
- Next.js app in `game-ssr/` with a standalone page at `/1game`.
- Visuals preserved with local stubs (no backend required to render UI).
- Ready for Render.com deploy via `render.yaml`.

Local Run
1) cd game-ssr
2) npm install
3) npm run dev
4) Open http://localhost:3000/1game

Deploy to Render
- Push this repository to GitHub.
- Render → New → Web Service → Select this repo.
- Render detects `render.yaml` and creates the service:
  - env: node
  - rootDir: game-ssr
  - build: npm install && npm run build
  - start: npm run start (binds to $PORT)
- After first deploy, open the service URL and append /1game

Git Quick Start
```
git init
git add -A
git commit -m "feat: add Next.js /1game standalone with stubs + render.yaml"
git branch -M main
git remote add origin https://github.com/<you>/energy888.git
git push -u origin main
```

Notes
- SSR is initially disabled for the board component to avoid `window`/`document` access issues. We can enable full SSR with Emotion SSR once needed.
- To wire real socket/data, replace stubs in `game-ssr/src/lib`, `game-ssr/src/data`, and components.


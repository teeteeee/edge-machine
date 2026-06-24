# Edge Machine

A World Cup 2026 soccer betting tracker built around one idea: **express the edge as territorial control, not margin.**

The model reads which side *controls* a game (possession + corners) — a high-confidence signal — and bets it through **control markets** (corner 1X2, team-corner totals) rather than higher-variance goal/margin markets. Correlated 2-leg pairs are taken on clear sieges; coin-flips route to the result side or pass.

## Stack
- **Backend** — `app.py`: Python stdlib HTTP server + SQLite (`predictions.db`). Picks, slate, base rates, storyline engine, and auto-settlement of 10 market types.
- **Frontend** — `web/`: React + Vite + Tailwind. Picks board (one card per game, both legs), analytics, and a strategy flow diagram. Build with `npm --prefix web run build`.
- **Data** — current team form (corners, possession) from public sports feeds; live odds; ESPN for settlement.

## Run
```bash
python3 app.py            # serves the built UI + API on :8787
npm --prefix web run dev  # frontend dev server (:5173)
```

## Notes
Secrets (`.apifootball_key`), the betting ledger (`predictions.db`), and local tooling are git-ignored. A fresh checkout creates empty tables on first run.

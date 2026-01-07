# Vendor Portal — Next.js 15 (App Router)

Converted from the provided React/Vite vendor portal to **Next.js 15 (App Router)** with:
- **No `src/` directory**
- **TypeScript**
- **Tailwind**
- **No ESLint** (no config, no scripts, and `next.config.mjs` ignores lint during build)

## Notes / Enhancements I applied
- **LocalStorage-backed store** for:
  - Auth (demo login)
  - Products (add/edit + visibility toggle)
  - Vendor profile (including logo)
- **Product listing UI is a table/rows (admin-panel style)** — no tall per-product cards.
- **Removed unused calendar + `react-day-picker`** to avoid React 19 peer-dependency conflicts.

## Run
```bash
npm install
npm run dev
```

Demo credentials:
- vendor@example.com
- password

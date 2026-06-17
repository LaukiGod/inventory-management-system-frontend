# Inventory Frontend

React + TypeScript + Vite frontend for the inventory management system.

---

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies all `/api/*` requests to the backend at `http://localhost:3000` (configured in `vite.config.ts`).

Make sure the backend is running first — see the backend README for setup.

---

## First login

There's no signup page by design. The first admin account is created directly in Supabase (see backend README). Once that exists:

1. Go to `/login`
2. Sign in with the admin email + password
3. Use **Staff → Add staff** to create accounts for everyone else

---

## Project structure

```
src/
├── App.tsx                    # Routing + route protection
├── main.tsx                   # Entry point
├── index.css                  # Design tokens (colors, spacing) + resets
├── api/
│   └── client.ts              # All API calls, typed, token handling
├── contexts/
│   ├── AuthContext.tsx        # Current user, login/logout
│   └── ToastContext.tsx       # Global toast notifications
├── components/
│   ├── ui.tsx                 # Button, Input, Modal, Badge, Card, etc.
│   ├── Layout.tsx              # Sidebar + responsive shell
│   ├── StockUpdateModal.tsx    # The core "log a stock update" flow
│   └── ItemFormModal.tsx       # Create/edit stock item form
└── pages/
    ├── Login.tsx
    ├── Items.tsx               # Stock list — shared by staff & admin
    ├── Today.tsx                # Staff: today's activity log
    └── admin/
        ├── Dashboard.tsx        # Summary cards + 7-day chart
        ├── Records.tsx          # Date range history + export
        ├── Staff.tsx             # Create/deactivate/reset staff accounts
        ├── Categories.tsx        # Manage categories
        └── Settings.tsx          # Change own password
```

---

## Design notes

- **Palette**: slate sidebar, white canvas, emerald for primary actions, amber strictly reserved for low-stock warnings, red strictly reserved for "consumed" actions and destructive actions.
- **The stock update modal** is the most-used screen in the app. It uses a large two-button toggle (Received / Used) sized for quick, accurate tapping on a phone, with a live preview of the resulting quantity before submitting.
- **Routing**: staff land on `/items`, admin lands on `/dashboard`. Admin-only routes redirect staff back to `/items` if they try to access them directly.
- **Mobile**: sidebar collapses behind a hamburger menu under 860px width. Card grids reflow to single column.
- No client-side state library — `useState` + a couple of small contexts are enough at this scale, in keeping with "don't overengineer."

---

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

Deploy `dist/` to any static host (Vercel, Netlify, S3 + CloudFront, etc.) and update the API proxy/base URL to point at your deployed backend.

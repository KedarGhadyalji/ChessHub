# Chess Knowledge Hub

A free, open-source educational platform for learning chess — interactive lessons with visual boards, step-by-step move demonstrations, and expert explanations.

## Quick Start

### 1. Install dependencies

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cd backend && cp .env.example .env
# Set DATABASE_URL and JWT_SECRET in .env

# Frontend
cd frontend && cp .env.example .env
```

### 3. Database setup

```bash
cd backend
npm run db:migrate   # Apply Prisma migrations
npm run db:seed      # Seed sample data
```

Default admin: `admin@chesshub.com` / `ChessHub@06`

### 4. Run dev servers

```bash
# Terminal 1
cd backend && npm run dev     # :4000

# Terminal 2
cd frontend && npm run dev    # :5173
```

Open http://localhost:5173 | Admin: http://localhost:5173/admin/login

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, React Router, chess.js, react-chessboard
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, JWT auth
- **UI**: shadcn/ui components, Lucide icons

## Features

### Public

- Homepage with hero, section cards, featured/recent lessons
- Lesson library with section + difficulty filters, search, pagination
- Lesson viewer with 4 block types (text, chessboard, annotation, animation)
- Full-text search with URL state and debounce
- Contact/feedback form

### Admin

- JWT-authenticated dashboard
- Lesson CRUD with publish toggle and builder
- Visual lesson builder: 4 block editors, undo/redo (Ctrl+Z), Ctrl+S save
- Section management with color picker
- Suggestion workflow (Open → In Review → Resolved)
- Analytics: visitor trends, popular lessons, search gaps

## Database Models

Admin · Section · Lesson · LessonBlock · Suggestion · VisitorStat · LessonView · SearchQuery

## Keyboard Shortcuts (Builder)

- `Ctrl+S` — Save
- `Ctrl+Z` — Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` — Redo

## Commands

```bash
# Backend
npm run dev          # nodemon dev server
npm run db:migrate   # Prisma migrations
npm run db:seed      # Seed data
npm run db:studio    # Prisma Studio
npm run db:reset     # Reset + re-seed

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
```

## License

MIT

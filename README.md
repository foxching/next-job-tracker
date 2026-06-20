# Job Tracker

A Kanban-style job application tracker built with Next.js, Mongodb, and Shadcn UI. Organize applications into fully customizable columns with support for multiple boards.

**Live demo:** [next-job-tracker-eight.vercel.app](https://next-job-tracker-eight.vercel.app)

## Features

- **Kanban board** — drag-and-drop style columns representing each stage of your job search pipeline
- **Job application cards** — track company, position, location, salary range, job URL, tags, description, and notes per application
- **Multi-board support** — create and switch between separate boards (e.g. "2025 Job Hunt", "Internships")
- **Board settings** — rename boards, manage columns, customize card display, and set sorting preferences
- **Light & dark mode**
- **Authentication** — per-user boards and applications, scoped to the signed-in account

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Styling | Tailwind CSS |
| Database | MongoDB with Mongoose |
| Authentication | [Better Auth](https://www.better-auth.com/) |
| Deployment | Vercel |

## Screenshots

### Dashboard
Track applications across pipeline stages with a clean, color-coded board.

### Add Job Application
Quickly log a new application with company, position, salary, tags, and notes.

### Edit Job Application
Update application details as your status changes.

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/<your-username>/job-tracker.git
cd job-tracker
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
.
├── app/
│   ├── dashboard/          # Main board view (Server Component, fetches initial data)
│   └── ...
├── components/
│   ├── ui/                 # Shadcn UI primitives
│   └── board-settings/     # Board settings dialog and tabs
├── lib/
│   ├── models/              # Mongoose schemas
│   ├── db.ts                # Database connection
│   └── auth.ts               # Better Auth configuration
└── ...
```

## Roadmap

- [ ] Drag-and-drop reordering between columns
- [ ] Export board data (CSV/JSON)
- [ ] Saved filters and custom sort orders
- [ ] Board duplication and archiving

## Contributing

Contributions are welcome. Please open an issue first to discuss any major changes.

## License

This project is licensed under the [MIT License](LICENSE).
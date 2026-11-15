# TaskFlow — Simple Task Manager

A lightweight task manager built with Next.js, React and TypeScript. Tasks are stored in your browser's localStorage (no database or login required).

## Features
- Add, edit and delete tasks
- Start date, due date, priority and status
- Track progress from 0–100%
- Dashboard counts, progress bar, overdue and upcoming tasks
- Search and filter by status
- Responsive layout

## Run locally
1. Install Node.js 18.17+.
2. Unzip this folder and open it in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

## Deploy to GitHub + Vercel
1. Create a GitHub repository and upload/push the contents of this folder.
2. In Vercel, choose **Add New → Project** and import that GitHub repository.
3. Framework preset: Next.js. Build command: `npm run build`; output settings can remain default.
4. Click Deploy.

## Important data note
This starter stores data in the browser only. Tasks are private to that browser/device and won't sync across devices or users. For shared/cloud persistence, connect a database (e.g. Supabase or Vercel Postgres) and add authentication.

## Suggested next improvements
- Notifications/email reminders (requires a server/cron and notification provider)
- Team members, comments and task assignments
- Calendar/Gantt timeline
- Database sync and login

# The Application Log 📋

A lightweight, dependency-free web app for tracking job applications — every company you've applied to, every reply you're owed.

Built with a "case file / dossier" visual concept: aged paper background, typewriter-style headers, and ink-stamp status badges (Applied, Interviewing, Offer, Rejected, Ghosted, Withdrawn).

![status](https://img.shields.io/badge/status-active-brightgreen) ![stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-blue)

---

## Features

- **Log every application** — company, position, date applied, status, job posting link, location, salary range, contact, follow-up date, and free-text notes.
- **Dashboard stats** — total cases, response rate, active leads, offers on the table, and follow-ups due.
- **Filter tabs** by status (All, Applied, Interviewing, Offer, Rejected, Ghosted, Withdrawn).
- **Search** by company or role, and **sort** by date, company name, or upcoming follow-up.
- **Automatic "days since applied"** counter on every entry.
- **Follow-up reminders** — entries with a past-due follow-up date are flagged in red.
- **Export / Import as JSON** — back up your data or move it between devices.
- **Fully responsive** — a proper table on desktop, stacked cards on mobile.
- **No build step, no dependencies, no backend** — open `index.html` and go.

## Tech stack

- **HTML5** — semantic markup, single-page structure with a modal dialog.
- **CSS3** — custom properties (CSS variables) for theming, CSS Grid & Flexbox for layout, no framework.
- **Vanilla JavaScript (ES6+)** — no libraries, no build tools.
- **`localStorage`** — all data is persisted directly in the browser. Nothing is sent to a server.

## Project structure

```
job-tracker/
├── index.html    # Page structure and modal form
├── style.css     # Visual design (design tokens, layout, responsive rules)
└── app.js        # App logic: state, rendering, CRUD, import/export
```

## Getting started

1. Clone or download this repository.
2. Open `index.html` in your browser — no installation or server required.

   From the terminal, inside the project folder:

   ```bash
   open index.html
   ```

   Or to force a specific browser:

   ```bash
   open -a Safari index.html
   ```

That's it. The app ships with 3 sample entries the first time you open it, just to show you how it looks — delete them or keep them as a reference.

## Usage

- **Add a case** — click **"+ Open a new file"** and fill in the form. Only *Company*, *Position*, and *Date applied* are required.
- **Edit a case** — click anywhere on a row (or the ✎ icon) to reopen the form pre-filled.
- **Delete a case** — click the 🗑 icon on a row, or the "Delete case" link inside the edit form.
- **Filter** — use the tabs above the table to narrow down by status.
- **Search** — type into the search box to filter by company or role in real time.
- **Sort** — use the dropdown to reorder by newest/oldest, company name, or nearest follow-up.
- **Back up your data** — click **Export** to download a `.json` snapshot of every case. Click **Import** to merge a previously exported file back in (existing entries are never overwritten).

## Data & privacy

All data lives in your browser's `localStorage`, scoped to the file/origin you open the app from. Nothing is transmitted anywhere. This also means:

- Data is **per browser and per device** — it won't sync automatically across machines. Use Export/Import to move it manually.
- Clearing your browser's site data (or `localStorage`) will erase your entries — export a backup periodically.
- If you host this on GitHub Pages, data will be scoped to that specific URL, separate from any copy you run locally.

## Deploying to GitHub Pages

1. Push this project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Source**, select the branch (e.g. `main`) and root folder.
4. Save — your app will be live at `https://<your-username>.github.io/<repo-name>/`.

## Roadmap / ideas

- [ ] Optional charts (e.g. applications-per-week trend, funnel by status)
- [ ] Reminder notifications (browser notifications or email digest)
- [ ] Dark mode toggle
- [ ] Multiple resume/cover-letter version tracking per case
- [ ] Cloud sync (would require a backend)

## License

Free to use, modify, and adapt for personal or portfolio use.

---

Built by [Gabriel Bellamy](https://gbielbellamy.github.io) as part of a personal job-search toolkit.

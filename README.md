# Daily Planner

A small personal planner: a drag-to-create day timeline, per-category daily
goals, a todo list, habit tracking with streaks, and default time blocks that
seed every new day. Data lives in the browser's localStorage only; there is no
backend and nothing leaves your device.

## Heads up

This is a **vibe-coded, personal-use project**. It was built quickly with an AI
coding assistant to fit one person's routine. Expect opinionated choices, no
tests, and no roadmap. Issues and pull requests are not being triaged.

The repository is public only because GitHub Pages on a free personal account
requires a public repo. It is not published as a product or a template, though
you are welcome to fork it.

## Running locally

Requires Node 24 (see `.nvmrc`).

```sh
nvm use
npm install
npm run dev -- --port 3000 --host
```

## Deploying

Publishing a GitHub release runs `.github/workflows/deploy-pages.yml`, which
builds the app and deploys it to GitHub Pages at
`https://jonathanbeber.github.io/daily-planner/`. The workflow can also be run
manually from the Actions tab. One-time setup: Settings → Pages → Source →
"GitHub Actions", and allow `v*` tags under Settings → Environments →
github-pages.

The deployed site is an installable PWA: on Android Chrome use "Install app"
from the menu, on iOS Safari use "Add to Home Screen". It works offline once
installed.

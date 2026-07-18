# CLAUDE.md

This app consumes the shared `lyra-ui` design system via a live source alias (`@nicecxone/lyra-ui`), not a local component library. Before writing or editing any UI code here:

- Import UI atoms from `@nicecxone/lyra-ui` — never build or reach for a local `src/components/ui/*` reimplementation of something that already exists there.
- Check `lyra-ui/src/index.ts` and that component's `__stories__` file *before* building anything — reuse the existing component, and match the exact markup shape shown in its story, not just the prop types (e.g. a plain labeled `Checkbox` is a manual `<label>` wrapper around it in most stories, not the `label` prop).
- Never modify a `lyra-ui` core component from here. If something this app needs doesn't exist yet in `lyra-ui`, that's a signal to add it there — not approximate it locally.
- When a screenshot or prompt describes a component ambiguously, or nothing in `lyra-ui` visually matches what's shown, ask the user which component to use or whether to build something new — don't guess. If building something new, keep it local to this app; don't add it to `lyra-ui` until the user explicitly asks (see `PROJECT_SUMMARY.md`'s "When a screenshot/prompt doesn't clearly match an existing component").
- Every modal's outer card uses `Container variant="modal"`, never a hand-rolled div.
- Use the shared `assets/app-icon.svg` mark for the app logo/smiley — never `CXoneSmiley` or a one-off hand-rolled SVG.
- Before reaching for a raw Tailwind utility value (spacing, sizing, radius, etc.), check other lyra-ui components/stories first for the established token.
- When copying a component's usage from a `__stories__` reference (e.g. a `Modal`'s fullscreen toggle, a `TabList`'s tab bar), copy its entire styling contract, not just enough to satisfy the prop types — transition/animation classes (`transition-all`, `duration-*`) and responsive props (`overflowMenu`, etc.) are easy to silently drop while focused on getting the visible structure right, and a static screenshot won't reveal that they're missing. Verify interactively (toggle it, resize it), not just visually.

Full rationale, worked examples, and the "why" behind each of these live in `../lyra-ui/PROJECT_SUMMARY.md` (see Important Patterns, Scope Rules, and the Post-layout QA checklist) — read that file before making non-trivial UI changes here.

## Sync check (do this first, every session)

This app depends on a live sibling checkout of `lyra-ui` (see the `@nicecxone/lyra-ui` alias path in `vite.config.ts` — currently `../lyra-ui`), not a versioned package. `.lyra-ui-sync` in this repo's root records the `lyra-ui` commit hash this app was last checked against.

1. Confirm the sibling path from `vite.config.ts`'s alias and check it's a real git repo (`git -C ../lyra-ui rev-parse HEAD`). If it's missing entirely (this project was moved without lyra-ui alongside it, or lyra-ui hasn't been cloned yet), skip this check silently — don't block on it.
2. Otherwise, diff since last sync: `git -C ../lyra-ui log --oneline "$(cat .lyra-ui-sync)"..HEAD`. Nothing printed means nothing changed — move on.
3. If there are new commits, read `../lyra-ui/PROJECT_SUMMARY.md` for a human-readable description of what those changes actually are (its "Key Components" entries and changelog-style bullets exist for exactly this). Summarize for the user what's new and whether anything in this app looks like it should be migrated to use it (same categories as the rules above — a hand-rolled pattern that a new/changed component now replaces).
4. Ask before migrating anything — don't silently rewrite pages.
5. Whether or not the user chooses to migrate, once they've seen and responded to the new changes, update `.lyra-ui-sync` to `lyra-ui`'s current HEAD hash (`git -C ../lyra-ui rev-parse HEAD`) so the same commits aren't re-flagged next session.

This same file/procedure is what a freshly duplicated copy of this template repo should keep doing — duplicating this repo carries `.lyra-ui-sync` and this `CLAUDE.md` along with it, so a new project built from this template inherits the sync check automatically as long as it keeps `lyra-ui` as a sibling checkout (or its `vite.config.ts` alias is updated to point at wherever `lyra-ui` actually lives).

## GitHub Pages setup (do this for every brand-new project, before the first deploy)

This app is a Vite SPA served from a GitHub Pages *project* page (a subpath like `https://<user>.github.io/<repo-name>/`, not the domain root). Left unconfigured, the site 404s or loads a blank page even when "Deploy from a branch" is turned on, because that setting only serves whatever's already built and pushed — it does not run a build step itself. For a new repo duplicated from this template, do all of the following, not just some:

1. Set `base: "/<repo-name>/"` in `vite.config.ts`, where `<repo-name>` is the *actual* GitHub repo slug for this project — not copied from whatever an earlier template/app used.
2. Fix `package.json`'s top-level `"name"` field to match this project too. It's easy to leave it as a copy-paste leftover from the template (this exact bug shipped in the `agent-next-gen-v1` sibling app — `"name": "lyra-ux-templates"` sat unnoticed in its `package.json` for a while); a wrong `name` is a signal something else was copy-pasted without review.
3. Add `gh-pages` and a `deploy` script: `"deploy": "vite build && gh-pages -d dist"`. If `npm run build` (the project's own typecheck-then-build script) is currently broken for unrelated pre-existing TypeScript errors, don't silently route `deploy` around it forever — flag that to the user as its own issue rather than treating "bypass tsc" as a normal part of this checklist.
4. Push the built `dist/` to a `gh-pages` branch (`npx gh-pages -d dist` handles this), then point the repo's Settings → Pages source at that `gh-pages` branch, folder `/ (root)`.
5. Re-run the deploy command after future changes — this isn't a one-time setup, `gh-pages` doesn't auto-run on push unless a CI workflow is added separately (and a CI-based build would need `lyra-ui` checked out in the runner too, since this app depends on it via a live sibling path alias, not a published package).

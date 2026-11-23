# Modular City plan

This is the entrypoint for work on modularcity.org.
Tasks live here, as user stories, each with the test that proves it.
Handoffs arrive in `.claude/inbox/`; drain them into this file, then move them to `.claude/inbox/done/`.

## Now

Land the two open pull requests:
- [modular-city#1](https://github.com/civicstudio/modular-city/pull/1), Touchpoints feedback and request processes, now carrying the production Touchpoints ids.
- [modular-city#2](https://github.com/civicstudio/modular-city/pull/2), the `/ledger/` "Check a city record" page and chain demos.

## Authoritative docs

- `CLAUDE.md` for commands and conventions (WCAG AAA, one attribute per line).
- `docs/CHAIN_DEMOS.md` for the registry and chain demos, and what each waits on.
- `TOUCHPOINTS_FORM_SPEC.md` for the feedback and request sections on service pages (on the Touchpoints branch).

## Tasks

### 1. Give feedback and follow a request on a service page
**As a** resident on `/services/pothole-report/`, **I want** to say whether the page helped and see how my request is handled, **so that** the city hears me and I know what happens next.
- [x] Service and park records carry Touchpoints form and process ids (`_data/services.json`, `_data/departments.json`).
- [x] Production ids filled in from the Touchpoints handoff of 2026-11-19: forms `458a618e…` (service) and `e767c280…` (park), process models 91–94 with their public path stories.
- [ ] Confirm the built pages link the production forms and stories, then merge [modular-city#1](https://github.com/civicstudio/modular-city/pull/1).
- [ ] 🖐 Once modularcity.org has a real inbox, ask Touchpoints to rerun its installer with `--notify-to`.
- [ ] Touchpoints moves the forms from the Civic Studio organization (34) to Modular City (74); ids stay the same, so no site change.

**Tests:** `spec/touchpoints_links_spec.rb`, `scripts/validate_city_data.mjs`.

### 2. Check a city record
**As a** curious resident on `/ledger/`, **I want** to check a city record against the public registry myself, **so that** I don't have to take the city's word for it.
- [x] Worked example: fictional adopted minutes, their fingerprint, and an RFC 6962 proof to the day root.
- [x] Registry checks linked only when live; the day-root and anchor-proof links say they are unsigned hash data, and that anchor 2 stays "Pending" until the treasury is funded.
- [ ] Merge [modular-city#2](https://github.com/civicstudio/modular-city/pull/2).

**Tests:** `spec/ledger_spec.rb`, `spec/accessibility_spec.rb`.

### 3. Dogfood Public Registry (blocked on Ryan)
**As a** public official evaluating modularcity.org, **I want** its catalog, a licensed merchant, its DID and its minutes to be checkable at registry.jurisdictional.org, **so that** I can see a city whose records anyone can verify.
- [x] Removed the dead `StatusList2021Service` from `.well-known/did.json`.
- [ ] 🖐 Ryan: run the registry key ceremony (civil_registry `docs/KEY_CEREMONY.md`) and fund the treasury (0 sats on 2026-11-19).
- [ ] 🖐 Ryan: choose the Qart anchor endpoint shape ([qart#268](https://github.com/afomi/qart/issues/268)).
- [ ] Then the registry sends the production DID, `#key-1` and `#certifier-1`, the published catalog, a fictional merchant certificate serial, and the minutes anchor id; link each from the site.

**Tests:** to be written per link as each arrives.

### 4. Fix link contrast on government, services and beta
**As a** resident with low vision on `/government.html`, **I want** links to stand out from body text, **so that** I can find the City Clerk.
- [x] Underline the "Provided by" department links on `/services.html` (axe `link-in-text-block`).
- [x] Darken the official initials on `/government.html` (`bg-primary-700`) and the stat labels on `/beta/index.html` (`text-slate-700`) to reach 7:1.

**Tests:** `spec/accessibility_spec.rb` (33 examples, 0 failures on 2026-11-22).

## Decisions for Ryan

- Production registry record credentials are signed with a key generated at boot, so each stops verifying at the next redeploy: re-issue them after the ceremony, or label them as signed by a temporary key.
  `/ledger/` links no signed credential, so it isn't affected.

## Housekeeping

- The main checkout holds uncommitted changes of unknown origin (`Gemfile`, `.ruby-version`, `.well-known/did.json`, the deploy workflow, `bin/setup`, `spec/spec_helper.rb`) and untracked notes at the root (`IDEALVILLE.md`, `PUBLISHING_A_DID.md`, `TOUCHPOINTS_*.md`, `*.html.erb`); `/tidy-strays` can sort them.

# Chain demonstrations on modularcity.org

Status: assessment, 2026-11-16.
Scope: what modularcity.org can show a public official about Public Registry (`~/workspace/civil_registry`, registry.jurisdictional.org) and Qart (`~/workspace/qart`) on a public chain, and whether the Ourquity demo belongs here.
Live claims were checked with read-only GETs on 2026-11-16; everything else was read from each repo's code.

## Site rules every demo must keep

- Build-time import and plain links; the CI build makes no network calls.
- No third-party iframes, so the WCAG AAA tests stay deterministic.
- Every page works without JavaScript.
- Every record is clearly fictional.
- Nothing on this site broadcasts a transaction, holds a key or takes money.

## What production looks like today

- registry.jurisdictional.org serves a dev-fallback DID (`did:web:civil-registry.local`, an Ed25519 key regenerated on every boot, no `#certifier-1`).
  Anything signed against it now won't verify later, so certificates and signed credentials wait for the real keys.
- `/api/v1/certificates` returns an empty list.
- `/api/events?after=0` returns no events, and `/api/treasury` shows a balance of 0 sats, so no record has been anchored in production.
- `/files/verify` and `/verify` are live.
- `/api/periods/:date` and `/api/anchors/:id/proof` are in the registry's code (commit 514561c) but answer 404 in production, so they aren't deployed yet.
- Qart has no `POST /api/v1/anchor` route yet, though the registry's `Signer.Qart` and docs/QART_BOUNDARY.md expect one (https://github.com/jurisdictional/registry/issues/33).
- Whether Modular City records go into production labelled fictional, or into a separate demo deployment, is Ryan's open decision.

## Ranked demonstrations

Ranked by how much a public official learns from it, weighted by how soon it can be real.

### 1. Adopted minutes anyone can check (built as a worked example)

- **Provides it:** Public Registry file anchoring, daily Merkle roots and inclusion proofs; the anchoring transaction is signed by the registry's BSV signer (Qart in the target design).
- **Live vs designed:** `/files/verify` and `/verify` are live.
  Period roots and proofs are built, not deployed.
  No production anchors exist yet.
- **Resident sees:** `/ledger/` ("Check a city record", linked from every footer).
  It walks through recomputing the SHA-256 of a fictional set of adopted minutes, shows how that fingerprint sits in a credential, how the credential is one leaf of a day's RFC 6962 tree, and the inclusion proof that reaches the day root.
  It links the registry's live checks, and a `/files/verify?sha256=…` link that honestly answers "no record" until the file is anchored.
  `/ledger/example-proof.json` has the same fields as `/api/anchors/:id/proof`, so a script that checks the example checks real proofs.
- **Effort:** site S (done in this branch); registry S once unblocked: upload the file, then send back the anchor id and day.
- **Blockers:** a funded treasury and anchoring turned on in the chosen deployment; the period routes deployed; Ryan's production-vs-demo decision.
  Hash anchoring itself doesn't depend on the DID keys, but the registry's anchor credential embeds an Ed25519 proof when a signing key is present, so anchoring before the real keys leaves a credential whose signature won't verify.
  Either wait for the keys or anchor with signing switched off and say so.

### 2. A licensed business whose license anyone can check

- **Provides it:** Public Registry issues and revokes a BRC-52 licensed-merchant certificate; Qart verifies it (byte-compatible with `@bsv/sdk`, with the merchant's BRC-77 proof of key ownership) and shows a W3C VC view on the owner's profile (qart docs/DEMO_LICENSED_MERCHANT.md, https://github.com/afomi/qart/issues/161).
- **Live vs designed:** both sides are built and tested against shared vectors; `/certificates/licensed-merchant` is live; production has no certificates.
  Revocation is recorded by the registry, not yet on chain.
- **Resident sees:** a fictional Modular City business on the business-license service page, with "Check this license" linking the registry's verify page and the certificate JSON.
- **Effort:** S once keys exist (one command on the registry side, one link here).
- **Blockers:** the registry's production certifier key (`JURISDICTION_CERTIFIER_WIF`) and DID keys.
  The service-page link touches `_layouts/service.html` and `_data/services.json`, which another branch is changing, so it lands after that merge.

### 3. The city DID names its hosted registry

- **Provides it:** `did:web:modularcity.org` (generated with Qart's DID playground, PUBLISHING_A_DID.md) cross-referencing the registry's `did:web:registry.jurisdictional.org`.
- **Live vs designed:** the city DID is published, and the dead status-list service has been removed (uncommitted in the main tree).
  The registry's real DID isn't served yet.
- **Resident sees:** nothing visible; a verifier (or the WeDID extension) sees that certificates signed by the registry's `#certifier-1` are issued on the city's behalf.
- **Effort:** S.
- **Blockers:** the registry's real keys.
  Don't add an `assertionMethod` for the current fallback key.

### 4. The city's daily public receipt

- **Provides it:** Public Registry's gap-free event stream, the treasury ledger and period roots.
- **Live vs designed:** event stream and treasury live (both empty); period roots built.
- **Resident sees:** a short "what the city recorded" table on `/ledger/`, imported by a script someone runs by hand and commits to `_data/`, with each day's root and a link to its anchor transaction.
- **Effort:** M.
- **Blockers:** records in the registry, which depend on demos 1 and 2.

### 5. Tickets for a city program as 1Sat ordinals

- **Provides it:** Qart ticketing (shape A in qart docs/TICKET_MINTING.md: the issuer mints its own collection, Qart delivers items), the Under the Oaks pattern.
- **Live vs designed:** checkout in sats or by card and SPV evidence (`Qart.SPV.Evidence`) are built; a real mint and a real sats payment are not covered by any test; minting is mainnet-only, and testnet has no indexer (https://github.com/afomi/qart/issues/10).
- **Resident sees:** an explainer of a free, fictional parks event whose admission is a collection item, with links to a testnet collection once one exists.
- **Effort:** M–L.
- **Blockers:** a testnet indexer, Qart's operational key (https://github.com/afomi/qart/issues/182), and the rule that a fictional city never takes real money.
  Revisit when Under the Oaks has run.

### 6. Later, from the registry's Phase 3

- Certificate of occupancy (designed in civil_registry docs/CERTIFICATE_OF_OCCUPANCY.md, a BRC-52 certificate with a public verify URL).
- A small-business grant at `/grants/browse`, a lottery for oversubscribed recreation slots, and fictional parcels from `seed/modular-city-civic-seed.json` at `/land`.
- Each is a plain link from the matching service page once the registry seeds the fictional records.

## Ourquity: not suitable as a demo on modularcity.org

**What it is.**
Ourquity (`~/workspace/ourquity`, live at ourquity.com) is a platform for crowdfunding the purchase of a property, typically a vacant storefront, through a special-purpose entity whose investors receive ownership tokens.
Alongside it, Ourquity researches Bitcoin primitives for shared ownership: `TransferGates`, `LienCovenant`, a right-of-first-refusal state machine and an anti-concentration cap.
Its docs/CITY_COUNCIL_REMARKS.md pitches it to councils as a partner, asking for the city's vacant-property list, expedited review and matching funds.
Production holds 1 user and 1 property title, with no tokens, campaigns, pledges or anchors (infra's count, 2026-11-17).

**It is being folded into Public Registry.**
Ryan directed on 2026-11-17 that Ourquity's app be folded into civil_registry and its server retired (civil_registry inbox, `from-infra-2026-11-17-fold-ourquity-into-civil-registry.md`; registry PLAN.md Phase 38, https://github.com/jurisdictional/registry/issues/75 to https://github.com/jurisdictional/registry/issues/80).
Liens, `/land`, `/landstack` and staff-side SPVs, tokens and gated transfers now run in the registry, and `/housing`, `/land` and `/landstack` answer 200 at registry.jurisdictional.org.
Campaigns, pledges and interest signups were set aside on purpose, pending a securities review.
ourquity.com becomes a static blog and essay.
So there is no separate Ourquity demo left to link; anything worth showing is now a Public Registry page.

**Why it doesn't fit a municipal reference site.**

- **It is an investment offering, not a city service.**
  Ourquity's own docs/SPV.md says the tokens are securities under the Howey test and need registration or an exemption (Reg D, Reg A+ or Reg CF).
  A city website linking to it reads as the city endorsing a particular private investment, which is the one thing a model municipal site shouldn't model.
- **The government-side pieces already live elsewhere.**
  Ourquity's PLAN.md (scope decision, 2026-06-13) hands property titles and parcel data to civil_registry and parcel maps to OpenSolano, and keeps only the ownership mechanics.
  The parts a city actually holds, titles and recorded liens, are civil_registry's to demonstrate.
- **There is nothing on chain for a resident to check yet.**
  Its enforcement brief places today's rules in app code (`TransferGates.evaluate/1`), with covenants as "where we're going".
- **It would break the site's rules.**
  Its scenarios use real Solano County places, so they can't be imported at build time as clearly fictional data.
- **The app is being retired.**
  Linking it now would leave a dead or redirected link within weeks.

**What could fit later, through Public Registry rather than Ourquity.**

- A fictional Modular City parcel with a recorded lien, from the registry's ported lien feature, shown as a city-recorded fact rather than an investment.
- The registry's `/landstack`, a data-free model of parcel strata, as a plain teaching link from a planning page.
- Ourquity's covenant research as background reading in this doc, not on the site.
- Nothing about selling ownership tokens, until a securities review says how a city may talk about it, if at all.

## Where Qart and Public Registry overlap

| Concern | Public Registry | Qart | Shared standard |
|---|---|---|---|
| Proof a transaction is in a block | Anchors keep `beef_hex`; ARC callbacks fill confirmation | `Qart.SPV.Evidence` keeps raw tx plus TSC merkle proof; `Qart.SPV.Beef` strictly reads BEEF | BEEF (BRC-62, BRC-95, BRC-96) with BUMP merkle paths (BRC-74) |
| Proof a record is in a day | RFC 6962 day roots and inclusion proofs | none | RFC 6962; the day root is what gets anchored |
| Who holds the BSV key | Record semantics and payload only (docs/QART_BOUNDARY.md) | The WIF, UTXOs, signing, broadcast | `POST /api/v1/anchor`, not built in Qart yet |
| Signed claims about a key | Issues BRC-52 certificates | Verifies BRC-52, checks BRC-77 key proofs, shows a W3C VC view | BRC-52, BRC-77, W3C VC 2.0; shared vector `docs/vectors/brc52_certificate_v1.json` |
| Identity documents | Jurisdiction `did:web` | DID playground that generated `did:web:modularcity.org` | W3C DID, `did:web` |
| Wallets | none for staff | BRC-100 wallet payments, BRC-42 derived keys | BRC-100, BRC-42 |
| Personal data on chain | Never; hashes only | None in tickets or receipts | Same rule both sides |

Recommendations, aligned with the BRCs above:

1. Make the portable proof one chain of three links: file SHA-256, then the RFC 6962 inclusion proof to the day root, then a BEEF with a BUMP (BRC-74) from the anchoring transaction to a block header.
   A resident's checker then needs no API from either project.
2. Have the registry publish that BEEF beside `/api/anchors/:id/proof`, and let Qart's `Qart.SPV.Beef` reader and the registry share one test vector, the way BRC-52 already does.
3. Build Qart's `POST /api/v1/anchor` so the registry stops holding a WIF in production.
   Until then, anchoring for Modular City should use the registry's testnet signer or wait.
4. Keep certificate and anchor formats standard (BRC-52, W3C VC, `did:web`), so a city can switch either tool without reissuing records.

## Requests sent

- civil_registry: `~/workspace/civil_registry/.claude/inbox/from-modular-city-2026-11-16-anchor-example-minutes.md` (deploy the period routes; anchor the example minutes once keys, treasury and the deployment choice are settled; reply with the anchor id).
- qart: `~/workspace/qart/.claude/inbox/from-modular-city-2026-11-16-shared-proof-vector.md` (a shared BEEF/BUMP vector with the registry, and the status of `POST /api/v1/anchor`).

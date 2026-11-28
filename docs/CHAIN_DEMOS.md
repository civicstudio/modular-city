# Chain demonstrations on modularcity.org

Status: assessment, 2026-11-16; production state and decisions updated 2026-11-19.
Scope: what modularcity.org can show a public official about Public Registry (`~/workspace/civil_registry`, registry.jurisdictional.org) and Qart (`~/workspace/qart`) on a public chain, and whether the Ourquity demo belongs here.
Live claims were re-checked with read-only GETs on 2026-11-19; everything else was read from each repo's code.

## Site rules every demo must keep

- Build-time import and plain links; the CI build makes no network calls.
- No third-party iframes, so the WCAG AAA tests stay deterministic.
- Every page works without JavaScript.
- Every record is clearly fictional.
- Nothing on this site broadcasts a transaction, holds a key or takes money.

## What production looks like today (checked 2026-11-19)

- registry.jurisdictional.org still serves a dev-fallback DID (`did:web:civil-registry.local`, an Ed25519 key regenerated on every boot, no `#certifier-1`).
  Anything signed against it now won't verify later, so certificates and signed credentials wait for the real keys.
- `/api/v1/certificates` returns an empty list.
- `/api/treasury` shows a balance of 0 sats and 0 anchors remaining.
- `/files/verify` and `/verify` are live.
- `/api/periods/:date` and `/api/anchors/:id/proof` were deployed on 2026-11-16 and answer JSON.
  Past days return their root (2026-11-18 has 48 leaves), today returns 409 while the day is open, and an unknown anchor returns `{"error":"No such anchor."}`.
- Those anchors are rows in the registry, not transactions: `/verify` shows them as pending, and with an unfunded treasury nothing has been written to a public blockchain.
- `/api/events?after=0` has 44 events, almost all `period_closed`, and no `record_anchored`.

## Decisions and open items

- **Decided (Ryan):** Modular City records go into production registry.jurisdictional.org, each labelled "Demo — fictional".
  There is no separate demo deployment.
- **Blocked on Ryan:** civil_registry won't anchor Modular City records until Ryan runs the key ceremony (civil_registry docs/KEY_CEREMONY.md) and funds the treasury.
  The key ceremony also unblocks certificates and the DID cross-reference.
- **Answered (civil-registry-28, 2026-11-19):** production anchors 1 (period 2026-11-17) and 2 (period 2026-11-18) are daily period roots: plain JSON hash and Merkle data, never signed, so nothing about them goes stale at the key ceremony.
  The Modular City minutes hash `6fca8f7f…` is a leaf of neither day.
  /ledger/ links them as live examples, noting that anchor 2 stays "Pending" until the treasury is funded and its transaction is broadcast.
- **Decision for Ryan (registry side):** production record-anchor credentials are signed with a key generated at boot, so each one stops verifying at the next redeploy.
  Re-issue them after the ceremony, or label them as signed by a temporary key.
  This doesn't affect /ledger/, which links no signed credential.
- **Blocked on Ryan:** Qart's `POST /api/v1/anchor`, which the registry's `Signer.Qart` and docs/QART_BOUNDARY.md expect, is unbuilt, and Ryan still has to choose its shape (https://github.com/afomi/qart/issues/268; registry side https://github.com/jurisdictional/registry/issues/33).

## Ranked demonstrations

Ranked by how much a public official learns from it, weighted by how soon it can be real.

### 1. Adopted minutes anyone can check (built as a worked example)

- **Provides it:** Public Registry file anchoring, daily Merkle roots and inclusion proofs; the anchoring transaction is signed by the registry's BSV signer (Qart in the target design).
- **Live vs designed:** `/files/verify`, `/verify`, period roots and inclusion proofs are live.
  No root has been written on chain yet, because the treasury is unfunded.
- **Resident sees:** `/ledger/` ("Check a city record", linked from every footer).
  It walks through recomputing the SHA-256 of a fictional set of adopted minutes, shows how that fingerprint sits in a credential, how the credential is one leaf of a day's RFC 6962 tree, and the inclusion proof that reaches the day root.
  It links the registry's live checks, and a `/files/verify?sha256=…` link that honestly answers "no record" until the file is anchored.
  `/ledger/example-proof.json` has the same fields as `/api/anchors/:id/proof`, so a script that checks the example checks real proofs.
- **Effort:** site S (done in this branch); registry S once unblocked: upload the file, then send back the anchor id and day.
- **Blockers:** Ryan's key ceremony and a funded treasury.
  civil_registry has said it won't anchor before both, which also avoids a credential whose Ed25519 proof would stop verifying once the fallback key is replaced.
  Then the file goes into production labelled "Demo — fictional".

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
- **Live vs designed:** event stream, treasury (0 sats) and period roots are live; no roots are on chain yet.
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
| Who holds the BSV key | Record semantics and payload only (docs/QART_BOUNDARY.md) | The WIF, UTXOs, signing, broadcast | `POST /api/v1/anchor`, unbuilt; shape awaits Ryan (https://github.com/afomi/qart/issues/268) |
| Signed claims about a key | Issues BRC-52 certificates | Verifies BRC-52, checks BRC-77 key proofs, shows a W3C VC view | BRC-52, BRC-77, W3C VC 2.0; shared vector `docs/vectors/brc52_certificate_v1.json` |
| Identity documents | Jurisdiction `did:web` | DID playground that generated `did:web:modularcity.org` | W3C DID, `did:web` |
| Wallets | none for staff | BRC-100 wallet payments, BRC-42 derived keys | BRC-100, BRC-42 |
| Personal data on chain | Never; hashes only | None in tickets or receipts | Same rule both sides |

Recommendations, aligned with the BRCs above:

1. Make the portable proof one chain of three links: file SHA-256, then the RFC 6962 inclusion proof to the day root, then a BEEF with a BUMP (BRC-74) from the anchoring transaction to a block header.
   A resident's checker then needs no API from either project.
2. Have the registry publish that BEEF beside `/api/anchors/:id/proof`, checked against the shared BEEF/BUMP vectors that already exist: bitblocks' `priv/data/interop/vectors_v1.json` (v1.0.0), which civil_registry copies from bitblocks.
   Qart's `Qart.SPV.Beef` reader should test against the same set, so no new vector is needed.
3. Build Qart's `POST /api/v1/anchor` so the registry stops holding a WIF in production, once Ryan picks its shape (https://github.com/afomi/qart/issues/268).
   Until then, Modular City anchoring waits on the key ceremony and treasury either way.
4. Keep certificate and anchor formats standard (BRC-52, W3C VC, `did:web`), so a city can switch either tool without reissuing records.

## Requests sent

- civil_registry: `~/workspace/civil_registry/.claude/inbox/from-modular-city-2026-11-16-anchor-example-minutes.md` (deploy the period routes, done 2026-11-16; anchor the example minutes in production, labelled "Demo — fictional", after Ryan's key ceremony and treasury funding; reply with the anchor id).
- qart: `~/workspace/qart/.claude/inbox/from-modular-city-2026-11-16-shared-proof-vector.md` (answered: `POST /api/v1/anchor` is https://github.com/afomi/qart/issues/268, shape not chosen; the shared vectors are bitblocks' `vectors_v1.json` v1.0.0).

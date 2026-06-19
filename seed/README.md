# Reusable civic domain seed

This directory is the portable handoff from Modular City to Civil Registry,
Jurisdictional, and Wardley. All people, places, identifiers, and records are
fictional. The data is released as CC0-1.0.

## Files

- `modular-city-civic-seed.json` — deterministic relational fixture data.
- `civic-seed.schema.json` — basic JSON Schema and minimum collection sizes.
- `domain-inventory.json` — DDD bounded contexts, aggregates, and invariants.
- `wardley-civic-ecosystem.json` — Wardley.app fragment-compatible nodes/edges.
- `wardley-civic-ecosystem.owm` — the same ecosystem in OWM DSL.

Regenerate and validate the artifacts from the repository root:

```sh
node scripts/generate_civic_seed.mjs
node scripts/generate_civic_seed.mjs --check
```

## Cardinality

Every requested top-level collection contains at least 10 records. Child
collections intentionally contain more:

- 10 property titles, each referencing 3 assessments, 3 deeds, and 3 recorded
  documents (30 of each child type).
- 10 weekly meetings in 2025, each with an agenda referencing 7–12 items
  (91 agenda items total).
- 10 credentials, each embedding 3 evidence records.
- Every agenda item contains 3 attachment URLs.

References use stable string IDs. Consumers should resolve these to local
database IDs during import rather than treating fixture IDs as database keys.

## Civil Registry adapter

| Fixture collection | Civil Registry target | Adapter note |
| --- | --- | --- |
| `properties` | No separate schema | Keep as an external parcel identity or add a `Property` aggregate. |
| `property_titles` | `CivilRegistry.Properties.PropertyTitle` | Resolve owner and assessor external IDs before insertion. |
| `property_assessments` | `CivilRegistry.Properties.PropertyAssessment` | Resolve title, assessor, and assessment-roll IDs. |
| `deeds` | `CivilRegistry.Properties.Deed` | Resolve `property_title_id`. |
| `recorded_documents` | `CivilRegistry.Recordings.RecordingSubmission` | `property_title_id` is a useful fixture extension not present in the current schema. |
| `marriage_licenses` | `CivilRegistry.Marriage.MarriageLicense` | Fields match the current changeset. |
| `civil_unions` | `CivilRegistry.Marriage.MarriageApplication` | Import with `license_type: "civil_union"`; there is no dedicated civil-union license schema. |
| `credential_types` | `CivilRegistry.Registry.RegistryType` | Resolve the jurisdiction ID. |
| `credentials` | `CivilRegistry.Registry.Credential` | Resolve registry type, issuer, and subject IDs. Evidence is an extension. |
| `certificates` | `BirthCertificate` or `DeathCertificate` | Dispatch by `certificate_type`; resolve submitter/reviewer IDs. |

## Jurisdictional adapter

Import `meetings` into `Jurisdictional.Civic.Meeting`, resolving
`body_external_id` to `body_id`. Import `agenda_items` into
`Jurisdictional.Civic.AgendaItem`, resolving the fixture meeting ID. The current
Jurisdictional model has no separate Agenda schema, so `agendas` is the source
document boundary and its URL/status fields should be flattened onto Meeting or
retained as source metadata.

## Wardley adapter

`wardley-civic-ecosystem.json` uses Wardley.app's fragment data shape:
`temp_id`, `source_temp_id`, and `target_temp_id`. Its coordinates are stored as
Wardley `x_pct`/`y_pct`. The `.owm` file uses `[visibility, evolution]` and can be
used by OWM-compatible tooling.

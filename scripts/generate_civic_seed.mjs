#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = path.join(root, "seed");
const generatedAt = "2026-06-18T00:00:00Z";

const pad = (value, width = 3) => String(value).padStart(width, "0");
const id = (prefix, value) => `${prefix}-${pad(value)}`;
const money = (dollars) => dollars * 100;
const isoDate = (month, day) => `2026-${pad(month, 2)}-${pad(day, 2)}`;

const streets = [
  ["101 Civic Way", "residential"],
  ["125 Civic Way", "residential"],
  ["200 Market Street", "commercial"],
  ["240 Market Street", "mixed"],
  ["18 Library Lane", "residential"],
  ["42 Orchard Road", "land"],
  ["77 Transit Avenue", "multifamily"],
  ["91 Transit Avenue", "multifamily"],
  ["310 River Street", "commercial"],
  ["12 Foundry Court", "mixed"]
];

const people = [
  "Avery Morgan", "Jordan Lee", "Riley Patel", "Cameron Brooks", "Taylor Nguyen",
  "Morgan Rivera", "Casey Johnson", "Alex Kim", "Jamie Okafor", "Drew Santos",
  "Quinn Foster", "Skyler Chen", "Reese Williams", "Parker Davis", "Rowan Thompson",
  "Sage Martinez", "Finley Brown", "Emerson Wilson", "Harper Garcia", "Dakota Miller"
];

const properties = streets.map(([streetAddress, propertyType], index) => {
  const n = index + 1;
  return {
    id: id("property", n),
    jurisdiction_id: "modular-city",
    parcel_number: `MC-01-${pad(n, 4)}`,
    street_address: streetAddress,
    city: "Modular City",
    county: "Example County",
    state: "EX",
    zip_code: `000${pad(n, 2)}`,
    property_type: propertyType,
    current_title_id: id("title", n)
  };
});

const propertyTitles = properties.map((property, index) => {
  const n = index + 1;
  const assessed = 185_000 + n * 37_500;
  return {
    id: id("title", n),
    property_id: property.id,
    title_number: `MC-T-${pad(n, 5)}`,
    status: "active",
    property_type: property.property_type,
    legal_description: `Lot ${n}, Block ${Math.ceil(n / 2)}, Modular City Civic Plat 2024-01`,
    street_address: property.street_address,
    city: property.city,
    county: property.county,
    state: property.state,
    zip_code: property.zip_code,
    parcel_number: property.parcel_number,
    lot_number: String(n),
    block_number: String(Math.ceil(n / 2)),
    subdivision: "Civic Demonstration District",
    acreage: Number((0.18 + n * 0.07).toFixed(2)),
    assessed_value_cents: money(assessed),
    market_value_cents: money(assessed + 24_000),
    owner_type: n % 4 === 0 ? "llc" : "individual",
    owner_external_id: id("person", ((n - 1) % 10) + 1),
    assessor_external_id: "person-assessor-001",
    approved_at: "2026-06-01T17:00:00Z",
    roll_year: 2026,
    roll_section: "1",
    assessment_ids: [1, 2, 3].map((child) => id(`assessment-${pad(n)}`, child)),
    deed_ids: [1, 2, 3].map((child) => id(`deed-${pad(n)}`, child)),
    recorded_document_ids: [1, 2, 3].map((child) => id(`recording-${pad(n)}`, child))
  };
});

const propertyAssessments = propertyTitles.flatMap((title, titleIndex) =>
  [2024, 2025, 2026].map((year, childIndex) => {
    const base = title.assessed_value_cents - (2 - childIndex) * money(12_500);
    return {
      id: title.assessment_ids[childIndex],
      property_title_id: title.id,
      assessor_external_id: "person-assessor-001",
      assessment_roll_external_id: `assessment-roll-${year}`,
      assessed_value_cents: base,
      market_value_cents: base + money(24_000),
      assessment_date: `${year}-01-15`,
      effective_date: `${year}-07-01`,
      expiration_date: `${year + 1}-06-30`,
      assessment_type: childIndex === 2 && titleIndex % 4 === 0 ? "revaluation" : "annual",
      methodology: "Comparable sales with cost approach cross-check",
      notes: "Fictional assessment for interoperability testing"
    };
  })
);

const deedTypes = ["warranty", "quitclaim", "bargain_sale"];
const deeds = propertyTitles.flatMap((title, titleIndex) =>
  [1, 2, 3].map((child, childIndex) => ({
    id: title.deed_ids[childIndex],
    property_title_id: title.id,
    deed_type: deedTypes[childIndex],
    book: `MC-${2023 + childIndex}`,
    page: String(100 + titleIndex * 3 + child),
    recording_date: `${2023 + childIndex}-${pad(titleIndex + 1, 2)}-15`,
    instrument_number: `MC-DEED-${2023 + childIndex}-${pad(titleIndex + 1, 4)}`,
    grantor: people[(titleIndex + childIndex) % people.length],
    grantee: people[(titleIndex + childIndex + 1) % people.length],
    consideration_cents: money(175_000 + titleIndex * 25_000 + childIndex * 10_000),
    document_url: `https://modularcity.org/records/deeds/${title.deed_ids[childIndex]}.pdf`,
    notes: "Fictional recorded deed"
  }))
);

const recordingTypes = ["deed", "mortgage", "lien"];
const recordedDocuments = propertyTitles.flatMap((title, titleIndex) =>
  [1, 2, 3].map((child, childIndex) => ({
    id: title.recorded_document_ids[childIndex],
    property_title_id: title.id,
    document_type: recordingTypes[childIndex],
    status: "recorded",
    grantor: people[(titleIndex + childIndex) % people.length],
    grantee: people[(titleIndex + childIndex + 2) % people.length],
    property_address: title.street_address,
    parcel_number: title.parcel_number,
    page_count: 2 + childIndex,
    recording_fee_cents: 1500 + childIndex * 500,
    file_path: `/seed/documents/${title.recorded_document_ids[childIndex]}.pdf`,
    file_name: `${title.recorded_document_ids[childIndex]}.pdf`,
    file_size: 64_000 + titleIndex * 1_000 + child * 250,
    recorded_at: `2026-0${child + 2}-${pad(titleIndex + 1, 2)}T18:00:00Z`,
    instrument_number: `MC-REC-2026-${pad(titleIndex * 3 + child, 5)}`,
    notes: "Fictional recording; no document binary is included"
  }))
);

const marriageLicenses = Array.from({length: 10}, (_, index) => {
  const n = index + 1;
  return {
    id: id("marriage-license", n),
    jurisdiction_id: "modular-city",
    status: n <= 7 ? "issued" : "pending",
    applicant_name: people[index],
    co_applicant_name: people[index + 10],
    date_of_marriage: isoDate(7 + (index % 3), 5 + index),
    place_of_marriage: n % 2 ? "Modular City Hall" : "Civic Commons",
    officiant_name: `Officiant ${people[(index + 4) % people.length]}`,
    license_number: `MC-ML-2026-${pad(n, 4)}`,
    witness_names: `${people[(index + 2) % people.length]}, ${people[(index + 3) % people.length]}`,
    license_issue_date: isoDate(6, 1 + index)
  };
});

const civilUnions = Array.from({length: 10}, (_, index) => {
  const n = index + 1;
  return {
    id: id("civil-union", n),
    jurisdiction_id: "modular-city",
    license_type: "civil_union",
    status: n <= 7 ? "license_issued" : "submitted",
    application_number: `CU-2026-${pad(n, 6)}`,
    applicant_1_first_name: people[index].split(" ")[0],
    applicant_1_last_name: people[index].split(" ")[1],
    applicant_1_dob: `${1982 + index}-03-12`,
    applicant_1_address: streets[index][0],
    applicant_1_city: "Modular City",
    applicant_1_state: "EX",
    applicant_1_zip: `000${pad(n, 2)}`,
    applicant_1_id_type: "state_id",
    applicant_2_first_name: people[index + 10].split(" ")[0],
    applicant_2_last_name: people[index + 10].split(" ")[1],
    applicant_2_dob: `${1980 + index}-08-20`,
    applicant_2_address: streets[(index + 3) % streets.length][0],
    applicant_2_city: "Modular City",
    applicant_2_state: "EX",
    applicant_2_zip: `000${pad(((index + 3) % 10) + 1, 2)}`,
    applicant_2_id_type: "driver_license",
    intended_ceremony_date: isoDate(8 + (index % 2), 5 + index),
    intended_ceremony_location: "Modular City Hall",
    application_fee_cents: 4000,
    submitted_at: `2026-06-${pad(1 + index, 2)}T16:00:00Z`
  };
});

const credentialTypes = [
  ["business_license", "Business License"],
  ["food_permit", "Food Service Permit"],
  ["building_permit", "Building Permit"],
  ["vendor_license", "Street Vendor License"],
  ["park_permit", "Park Use Permit"],
  ["trade_license", "Skilled Trade License"],
  ["occupancy_permit", "Certificate of Occupancy"],
  ["notary_commission", "Notary Commission"],
  ["inspection_badge", "Municipal Inspector Badge"],
  ["records_officer", "Records Officer Authorization"]
].map(([code, name], index) => ({
  id: id("credential-type", index + 1),
  jurisdiction_id: "modular-city",
  code,
  name,
  description: `Fictional ${name.toLowerCase()} credential type`,
  validity_period_days: index % 3 === 0 ? 365 : 730,
  renewable: true,
  claims_schema: {required: ["holderName", "jurisdiction", "credentialType"]}
}));

const credentials = credentialTypes.map((type, index) => {
  const n = index + 1;
  return {
    id: id("credential", n),
    registry_type_id: type.id,
    registry_type_code: type.code,
    credential_number: `MC-CRD-2026-${pad(n, 5)}`,
    subject_external_id: id("person", n),
    subject_did: `did:web:modularcity.org:residents:${pad(n)}`,
    issuer_external_id: "modular-city-city-clerk",
    issuer_did: "did:web:modularcity.org",
    claims: {holderName: people[index], jurisdiction: "modular-city", credentialType: type.name},
    issued_at: `2026-06-${pad(n, 2)}T17:00:00Z`,
    valid_from: isoDate(6, n),
    valid_until: `2027-06-${pad(n, 2)}`,
    status: "active",
    evidence: [
      {type: "identity_verification", ref: `evidence-${pad(n)}-001`},
      {type: "application_review", ref: `evidence-${pad(n)}-002`},
      {type: "fee_payment", ref: `evidence-${pad(n)}-003`}
    ]
  };
});

const certificates = Array.from({length: 10}, (_, index) => {
  const n = index + 1;
  const common = {
    id: id("certificate", n),
    jurisdiction_id: "modular-city",
    certificate_number: `MC-${n <= 5 ? "BC" : "DC"}-2026-${pad(n, 5)}`,
    status: n % 4 === 0 ? "submitted" : "recorded",
    registrar_district: "MC-01",
    recording_fee_cents: 1500
  };

  return n <= 5
    ? {...common, certificate_type: "birth", child_name: people[index], date_of_birth: `${1990 + index}-04-${pad(10 + index, 2)}`, place_of_birth: "Modular City General Hospital", sex: index % 2 ? "female" : "male", parent_1_name: people[index + 5], parent_2_name: people[index + 10], attending_physician: `Dr. ${people[index + 3]}`, hospital_name: "Modular City General Hospital", jurisdiction_fips: "9900001"}
    : {...common, certificate_type: "death", decedent_name: people[index], date_of_death: isoDate(4, 10 + index), place_of_death: "Modular City", county_of_death: "Example County", certifying_physician_type: "attending_physician", manner_of_death: "natural"};
});

const meetingBodies = ["city-council", "planning-commission", "parks-board", "budget-committee", "transportation-board"];
const meetingSubjects = ["General government", "Housing plan", "Parks capital plan", "Annual budget", "Transit service"];
const meetingDates = [
  "2025-01-15", "2025-01-22", "2025-01-29", "2025-02-05", "2025-02-12",
  "2025-02-19", "2025-02-26", "2025-03-05", "2025-03-12", "2025-03-19"
];
const shiftDate = (date, days) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
const meetings = Array.from({length: 10}, (_, index) => {
  const n = index + 1;
  const body = meetingBodies[index % meetingBodies.length];
  const meetingDate = meetingDates[index];
  return {
    id: id("meeting", n),
    jurisdiction_id: "modular-city",
    body_external_id: `modular-city-${body}`,
    title: `${meetingSubjects[index % meetingSubjects.length]} meeting ${n}`,
    meeting_type: index % 4 === 1 ? "public_hearing" : "regular",
    description: `Public meeting concerning ${meetingSubjects[index % meetingSubjects.length].toLowerCase()}`,
    start_time: `${meetingDate}T02:00:00Z`,
    end_time: `${meetingDate}T04:00:00Z`,
    timezone: "America/Los_Angeles",
    location_name: "Modular City Hall",
    location_address: "100 Main Street, Modular City, EX 00001",
    location_room: n % 2 ? "Council Chamber" : "Room 204",
    virtual_url: `https://meet.modularcity.org/${id("meeting", n)}`,
    is_hybrid: true,
    agenda_url: `https://modularcity.org/meetings/${id("meeting", n)}/agenda`,
    minutes_url: `https://modularcity.org/meetings/${id("meeting", n)}/minutes.pdf`,
    video_url: `https://video.modularcity.org/meetings/${id("meeting", n)}`,
    public_comment_enabled: true,
    public_comment_email: "publiccomment@modularcity.org",
    status: "completed",
    external_id: `MC-MTG-2025-${pad(n, 4)}`,
    source_url: `https://modularcity.org/meetings/${id("meeting", n)}`,
    agenda_id: id("agenda", n)
  };
});

const agendaTopics = [
  {title: "Call to order and pledge", item_type: "ceremonial", vote_required: false, public_comment: false},
  {title: "Roll call and disclosure of conflicts", item_type: "report", vote_required: false, public_comment: false},
  {title: "Approval of prior meeting minutes", item_type: "consent", vote_required: true, public_comment: false},
  {title: "General public comment", item_type: "discussion", vote_required: false, public_comment: true},
  {title: "Consent calendar", item_type: "consent", vote_required: true, public_comment: false},
  {title: "Department performance and staffing report", item_type: "report", vote_required: false, public_comment: false},
  {title: "Public hearing on the annual policy update", item_type: "public_hearing", vote_required: true, public_comment: true},
  {title: "Capital improvement project authorization", item_type: "action", vote_required: true, public_comment: true},
  {title: "Award of professional services contract", item_type: "action", vote_required: true, public_comment: false},
  {title: "Appointments to boards and commissions", item_type: "action", vote_required: true, public_comment: false},
  {title: "Member comments and future agenda requests", item_type: "discussion", vote_required: false, public_comment: false},
  {title: "Adjournment", item_type: "other", vote_required: false, public_comment: false}
];
const agendas = meetings.map((meeting, index) => {
  const itemCount = 7 + (index % 6);
  return {
    id: id("agenda", index + 1),
    meeting_id: meeting.id,
    title: `Agenda — ${meeting.title}`,
    status: "published",
    published_at: `${shiftDate(meetingDates[index], -5)}T17:00:00Z`,
    source_url: meeting.agenda_url,
    agenda_item_ids: Array.from({length: itemCount}, (_, childIndex) => id(`agenda-item-${pad(index + 1)}`, childIndex + 1))
  };
});

const agendaItems = agendas.flatMap((agenda, agendaIndex) =>
  agenda.agenda_item_ids.map((agendaItemId, childIndex) => {
    const topic = agendaTopics[childIndex];
    return {
    id: agendaItemId,
    agenda_id: agenda.id,
    meeting_id: agenda.meeting_id,
    item_number: `${childIndex + 1}.0`,
    title: topic.title,
    description: `${topic.title} concerning ${meetingSubjects[agendaIndex % meetingSubjects.length].toLowerCase()}. Fictional item for interoperability testing.`,
    item_type: topic.item_type,
    display_order: childIndex + 1,
    public_comment_period: topic.public_comment,
    public_hearing: topic.item_type === "public_hearing",
    vote_required: topic.vote_required,
    vote_threshold: topic.vote_required ? "simple_majority" : null,
    document_url: `https://modularcity.org/agendas/${agenda.id}/${childIndex + 1}.pdf`,
    staff_report_url: childIndex >= 5 && childIndex <= 9 ? `https://modularcity.org/reports/${agenda.id}-${childIndex + 1}.pdf` : null,
    attachment_urls: [1, 2, 3].map((attachment) => `https://modularcity.org/agendas/${agenda.id}/${childIndex + 1}/attachment-${attachment}.pdf`),
    outcome: topic.vote_required ? "approved" : "no_action",
    outcome_notes: topic.vote_required ? "Approved following discussion." : "Received without formal action.",
    external_id: `MC-AGI-${pad(agendaIndex + 1)}-${pad(childIndex + 1)}`
    };
  })
);

const seed = {
  $schema: "./civic-seed.schema.json",
  schema_version: "1.0.0",
  seed_id: "modular-city-civic-domain-seed",
  generated_at: generatedAt,
  license: "CC0-1.0",
  fictional: true,
  description: "Deterministic demonstration records for American public-institution domain modeling.",
  jurisdiction: {id: "modular-city", name: "Modular City", type: "municipality", state: "EX", timezone: "America/Los_Angeles", website: "https://modularcity.org"},
  agencies: [
    {id: "modular-city-city-clerk", name: "City Clerk", role: "records_and_licensing"},
    {id: "modular-city-assessor", name: "Office of the Assessor", role: "property_assessment"},
    {id: "modular-city-recorder", name: "Office of the Recorder", role: "document_recording"},
    {id: "modular-city-council", name: "City Council", role: "governing_body"}
  ],
  properties,
  property_titles: propertyTitles,
  property_assessments: propertyAssessments,
  deeds,
  recorded_documents: recordedDocuments,
  marriage_licenses: marriageLicenses,
  civil_unions: civilUnions,
  credential_types: credentialTypes,
  credentials,
  certificates,
  meetings,
  agendas,
  agenda_items: agendaItems
};

const wardleyNodes = [
  ["resident", "Resident / business", 90, 5, {type: "user"}],
  ["public-record", "Trusted public record", 55, 15, {type: "service", category: "Public value"}],
  ["property", "Property registry", 42, 30, {type: "service", bounded_context: "land_records"}],
  ["recording", "Document recording", 48, 35, {type: "service", bounded_context: "recording"}],
  ["civil-status", "Civil status licensing", 40, 40, {type: "service", bounded_context: "civil_status"}],
  ["credential", "Credential issuance", 50, 45, {type: "service", bounded_context: "credentials"}],
  ["meeting", "Public meeting access", 65, 32, {type: "service", bounded_context: "public_meetings"}],
  ["jurisdiction", "Jurisdiction identity", 72, 58, {type: "data", owner: "jurisdictional"}],
  ["agenda", "Agenda publishing", 58, 55, {type: "component", owner: "jurisdictional"}],
  ["civil-registry", "Civil Registry", 38, 65, {type: "platform", owner: "civil_registry", evolve_x: 55}],
  ["domain-inventory", "Civic domain inventory", 28, 70, {type: "data", owner: "modular-city", evolve_x: 48}],
  ["identity", "Identity and authorization", 82, 78, {type: "infrastructure"}],
  ["storage", "Durable record storage", 88, 86, {type: "infrastructure"}],
  ["audit", "Audit and provenance", 62, 82, {type: "infrastructure"}]
].map(([temp_id, text, x_pct, y_pct, metadata]) => ({temp_id, text, x_pct, y_pct, metadata}));

const wardleyEdges = [
  ["resident", "public-record"], ["resident", "meeting"],
  ["public-record", "property"], ["public-record", "recording"], ["public-record", "civil-status"], ["public-record", "credential"],
  ["property", "civil-registry"], ["recording", "civil-registry"], ["civil-status", "civil-registry"], ["credential", "civil-registry"],
  ["meeting", "agenda"], ["meeting", "jurisdiction"], ["agenda", "jurisdiction"],
  ["civil-registry", "jurisdiction"], ["civil-registry", "domain-inventory"], ["agenda", "domain-inventory"],
  ["civil-registry", "identity"], ["civil-registry", "storage"], ["civil-registry", "audit"],
  ["agenda", "storage"], ["jurisdiction", "storage"]
].map(([source_temp_id, target_temp_id]) => ({source_temp_id, target_temp_id, metadata: {relationship: "depends_on"}}));

const wardleyFragment = {
  schema_version: "1.0.0",
  seed_id: "modular-city-civic-ecosystem",
  generated_at: generatedAt,
  map: {name: "Modular City Civic Record Ecosystem", visibility: "public"},
  fragment: {name: "Civic Record Ecosystem", description: "Reusable Wardley.app fragment for the civic domain inventory", data: {nodes: wardleyNodes, edges: wardleyEdges}}
};

const wardleyDsl = [
  "title Modular City Civic Record Ecosystem",
  "",
  ...wardleyNodes.map((node) => `${node.metadata.type === "user" ? "anchor" : "component"} ${node.text} [${((100 - node.y_pct) / 100).toFixed(2)}, ${(node.x_pct / 100).toFixed(2)}]`),
  "",
  ...wardleyEdges.map((edge) => `${wardleyNodes.find((node) => node.temp_id === edge.source_temp_id).text}->${wardleyNodes.find((node) => node.temp_id === edge.target_temp_id).text}`),
  "",
  ...wardleyNodes.filter((node) => node.metadata.evolve_x).map((node) => `evolve ${node.text} ${(node.metadata.evolve_x / 100).toFixed(2)}`),
  ""
].join("\n");

function validate() {
  const minimumTen = ["properties", "property_titles", "property_assessments", "deeds", "recorded_documents", "marriage_licenses", "civil_unions", "credential_types", "credentials", "certificates", "meetings", "agendas", "agenda_items"];
  for (const collection of minimumTen) {
    if (seed[collection].length < 10) throw new Error(`${collection} must contain at least 10 records`);
    const ids = seed[collection].map((record) => record.id);
    if (new Set(ids).size !== ids.length) throw new Error(`${collection} contains duplicate IDs`);
  }

  const childIds = (collection) => new Set(seed[collection].map((record) => record.id));
  const assessmentIds = childIds("property_assessments");
  const deedIds = childIds("deeds");
  const recordingIds = childIds("recorded_documents");
  for (const title of seed.property_titles) {
    for (const [field, set] of [["assessment_ids", assessmentIds], ["deed_ids", deedIds], ["recorded_document_ids", recordingIds]]) {
      if (title[field].length < 3 || title[field].some((child) => !set.has(child))) throw new Error(`${title.id}.${field} must reference at least three valid children`);
    }
  }

  const agendaItemIds = childIds("agenda_items");
  for (const agenda of seed.agendas) {
    if (agenda.agenda_item_ids.length < 7 || agenda.agenda_item_ids.length > 12 || agenda.agenda_item_ids.some((child) => !agendaItemIds.has(child))) throw new Error(`${agenda.id} must reference 7–12 valid agenda items`);
  }
  for (const meeting of seed.meetings) {
    if (!meeting.start_time.startsWith("2025-") || !meeting.end_time.startsWith("2025-")) throw new Error(`${meeting.id} must occur in 2025`);
  }
  for (const credential of seed.credentials) {
    if (credential.evidence.length < 3) throw new Error(`${credential.id} must contain at least three evidence records`);
  }
}

validate();

const outputs = new Map([
  [path.join(seedDir, "modular-city-civic-seed.json"), `${JSON.stringify(seed, null, 2)}\n`],
  [path.join(seedDir, "wardley-civic-ecosystem.json"), `${JSON.stringify(wardleyFragment, null, 2)}\n`],
  [path.join(seedDir, "wardley-civic-ecosystem.owm"), wardleyDsl]
]);

if (process.argv.includes("--check")) {
  for (const [file, expected] of outputs) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== expected) {
      console.error(`${path.relative(root, file)} is stale; run node scripts/generate_civic_seed.mjs`);
      process.exitCode = 1;
    }
  }
} else {
  fs.mkdirSync(seedDir, {recursive: true});
  for (const [file, contents] of outputs) fs.writeFileSync(file, contents);
  console.log(`Generated ${outputs.size} civic seed artifacts.`);
}

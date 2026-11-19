#!/usr/bin/env node
// Builds the worked "check a city record" example on /ledger/.
//
// Everything here is fictional and offline: no network, no keys, no chain.
// It mirrors how Public Registry (registry.jurisdictional.org) proves a file:
//
//   file bytes --SHA-256--> file fingerprint
//   fingerprint is named in an anchor credential (credentialSubject.sha256)
//   credential bytes --SHA-256--> leaf
//   leaves of one UTC day --RFC 6962 Merkle tree--> day root
//   day root --> one BSV transaction (not done here: this example is unanchored)
//
// The Merkle construction matches CivilRegistry.ChainAnchor.Merkle:
//   leaf hash  = SHA-256(0x00 || leaf hex text as UTF-8)
//   node hash  = SHA-256(0x01 || left || right)
//   split at the largest power of two below n.
//
// Usage, from the repository root:
//   node scripts/ledger_example.mjs          write the credential and _data/ledger.json
//   node scripts/ledger_example.mjs --check  fail if either file is stale or a proof fails

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const MINUTES = "ledger/examples/2025-01-14-city-council-minutes.txt";
const CREDENTIAL = "ledger/examples/2025-01-14-city-council-minutes.credential.json";
const DATA = "_data/ledger.json";
const DAY = "2025-01-28";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest();
const hex = (buf) => buf.toString("hex");

const leafHash = (leafText) => sha256(Buffer.concat([Buffer.from([0]), Buffer.from(leafText, "utf8")]));
const nodeHash = (left, right) => sha256(Buffer.concat([Buffer.from([1]), left, right]));

function splitPoint(n) {
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}

function mth(leaves) {
  if (leaves.length === 0) return sha256(Buffer.alloc(0));
  if (leaves.length === 1) return leafHash(leaves[0]);
  const k = splitPoint(leaves.length);
  return nodeHash(mth(leaves.slice(0, k)), mth(leaves.slice(k)));
}

function path(leaves, index) {
  if (leaves.length === 1) return [];
  const k = splitPoint(leaves.length);
  const left = leaves.slice(0, k);
  const right = leaves.slice(k);
  return index < k
    ? [...path(left, index), { hash: hex(mth(right)), position: "right" }]
    : [...path(right, index - k), { hash: hex(mth(left)), position: "left" }];
}

function verify(leaf, proof, root) {
  const computed = proof.reduce(
    (acc, step) =>
      step.position === "left"
        ? nodeHash(Buffer.from(step.hash, "hex"), acc)
        : nodeHash(acc, Buffer.from(step.hash, "hex")),
    leafHash(leaf)
  );
  return hex(computed) === root.toLowerCase();
}

const minutesSha = hex(sha256(readFileSync(MINUTES)));

const credential = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential", "GovernmentRecordAnchor"],
  fictional: true,
  note: "Fictional example in the shape Public Registry anchors. Unsigned: it has no proof block and was never anchored on chain.",
  issuer: {
    id: "did:web:modularcity.org",
    name: "City Clerk, Modular City"
  },
  issuanceDate: "2025-01-28T18:00:00Z",
  credentialSubject: {
    type: "FileHashAnchor",
    recordType: "file",
    filename: "2025-01-14-city-council-minutes.txt",
    contentType: "text/plain; charset=utf-8",
    sha256: minutesSha,
    record: "MC-MTG-2025-0001"
  }
};
const credentialText = JSON.stringify(credential, null, 2) + "\n";
const credentialLeaf = hex(sha256(Buffer.from(credentialText, "utf8")));

// The other records closed the same fictional day. Each leaf is the SHA-256 of
// a short label, so anyone can regenerate them; they stand in for anchors
// whose documents are not published here.
const neighbours = [
  "Modular City fictional record: business license BL-2025-0007 issued",
  "Modular City fictional record: building permit BP-2025-0013 finaled",
  "Modular City fictional record: grant MCG-2025-0002 disbursement 1"
].map((label) => ({ label, hash: hex(sha256(Buffer.from(label, "utf8"))) }));

const leaves = [
  { label: "Adopted minutes, City Council, January 14, 2025 (the credential above)", hash: credentialLeaf },
  ...neighbours
];
const leafHashes = leaves.map((l) => l.hash);
const index = 0;
const root = hex(mth(leafHashes));
const proof = path(leafHashes, index);

if (!verify(leafHashes[index], proof, root)) {
  console.error("FAILED: the inclusion proof does not reach the root");
  process.exit(1);
}

const data = {
  fictional: true,
  generated_by: "scripts/ledger_example.mjs",
  anchored_on_chain: false,
  artifact: {
    title: "Adopted minutes, City Council regular meeting, January 14, 2025",
    record: "MC-MTG-2025-0001",
    url: "/" + MINUTES,
    sha256: minutesSha
  },
  credential: {
    url: "/" + CREDENTIAL,
    sha256: credentialLeaf,
    names_sha256: minutesSha
  },
  period: {
    period_kind: "day",
    period: DAY,
    algorithm: "rfc6962-sha256",
    leaf_count: leaves.length,
    leaves: leaves.map((l, i) => ({ index: i, label: l.label, hash: l.hash })),
    root
  },
  inclusion_proof: {
    leaf: leafHashes[index],
    leaf_index: index,
    root,
    proof
  }
};
const dataText = JSON.stringify(data, null, 2) + "\n";

if (process.argv.includes("--check")) {
  const stale = [
    [CREDENTIAL, credentialText],
    [DATA, dataText]
  ].filter(([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text);
  if (stale.length) {
    console.error(`FAILED: stale ${stale.map(([f]) => f).join(", ")}; run node scripts/ledger_example.mjs`);
    process.exit(1);
  }
  console.log(`OK: minutes ${minutesSha}, root ${root}, proof verifies (${proof.length} steps)`);
} else {
  writeFileSync(CREDENTIAL, credentialText);
  writeFileSync(DATA, dataText);
  console.log(`Wrote ${CREDENTIAL} and ${DATA}`);
  console.log(`minutes sha256 ${minutesSha}`);
  console.log(`day root       ${root}`);
}

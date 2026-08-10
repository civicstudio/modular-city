#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const modularCityRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cityDataDir = process.env.MODULAR_CITY_DATA_DIR
  ? path.resolve(process.env.MODULAR_CITY_DATA_DIR)
  : path.join(modularCityRoot, "_data", "city");
const requiredFiles = ["civic.json", "departments.json", "services.json"];
const parsed = new Map();
const errors = [];

const cityDataFiles = fs.existsSync(cityDataDir)
  ? fs.readdirSync(cityDataDir).filter((filename) => filename.endsWith(".json")).sort()
  : [];

for (const filename of cityDataFiles) {
  const filePath = path.join(cityDataDir, filename);
  try {
    parsed.set(filename, JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch (error) {
    errors.push(`${filename}: invalid JSON (${error.message})`);
  }
}

for (const filename of requiredFiles) {
  if (!parsed.has(filename) && !cityDataFiles.includes(filename)) {
    errors.push(`${filename}: missing; run bin/setup`);
  }
}

const civic = parsed.get("civic.json");
if (civic && (!civic.jurisdiction || !Array.isArray(civic.services))) {
  errors.push("civic.json: expected jurisdiction and services");
}

const departments = parsed.get("departments.json");
if (departments && !Array.isArray(departments)) {
  errors.push("departments.json: expected an array");
}

const services = parsed.get("services.json");
if (services && !Array.isArray(services)) {
  errors.push("services.json: expected an array");
}

if (Array.isArray(services)) {
  const ids = new Set();
  const slugs = new Set();
  const civicServiceIds = new Set(
    Array.isArray(civic?.services) ? civic.services.map((service) => service.id) : []
  );

  services.forEach((service, index) => {
    const location = `services.json[${index}]`;
    for (const field of ["id", "civic_data_id", "slug", "name"]) {
      if (typeof service[field] !== "string" || service[field].trim() === "") {
        errors.push(`${location}.${field}: expected a non-empty string`);
      }
    }
    if (ids.has(service.id)) errors.push(`${location}.id: duplicate ${service.id}`);
    if (slugs.has(service.slug)) errors.push(`${location}.slug: duplicate ${service.slug}`);
    if (service.id) ids.add(service.id);
    if (service.slug) slugs.add(service.slug);
    if (service.civic_data_id && !civicServiceIds.has(service.civic_data_id)) {
      errors.push(`${location}.civic_data_id: no matching service in civic.json`);
    }
  });
}

if (errors.length > 0) {
  console.error("City data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${cityDataFiles.length} city data files in ${path.relative(modularCityRoot, cityDataDir)}.`
);

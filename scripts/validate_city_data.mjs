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

// Touchpoints ids attach to service and department records (see TOUCHPOINTS_FORM_SPEC.md).
// An id is null until Touchpoints assigns one; otherwise it must be a UUID.
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const feedbackKinds = new Set(["service", "park"]);
const requestTypes = parsed.get("request_types.json");
const open311Codes = new Set(
  Array.isArray(requestTypes) ? requestTypes.map((requestType) => requestType.service_code) : []
);

function checkOptionalUuid(value, location) {
  if (value !== null && value !== undefined && !(typeof value === "string" && uuidPattern.test(value))) {
    errors.push(`${location}: expected a UUID or null`);
  }
}

function checkTouchpoints(touchpoints, location) {
  if (touchpoints === undefined) return;
  if (touchpoints === null || typeof touchpoints !== "object") {
    errors.push(`${location}: expected an object`);
    return;
  }
  const form = touchpoints.feedback_form;
  if (form !== undefined) {
    if (!form || !feedbackKinds.has(form.kind)) {
      errors.push(`${location}.feedback_form.kind: expected "service" or "park"`);
    }
    checkOptionalUuid(form?.id, `${location}.feedback_form.id`);
  }
  const request = touchpoints.request;
  if (request !== undefined) {
    if (!request || typeof request.process !== "string" || request.process.trim() === "") {
      errors.push(`${location}.request.process: expected a non-empty string`);
    }
    checkOptionalUuid(request?.intake_form_id, `${location}.request.intake_form_id`);
    if (request?.open311_service_code !== undefined && !open311Codes.has(request.open311_service_code)) {
      errors.push(`${location}.request.open311_service_code: no matching request type in request_types.json`);
    }
    if (
      request?.response_deadline_business_days !== undefined &&
      !(Number.isInteger(request.response_deadline_business_days) && request.response_deadline_business_days > 0)
    ) {
      errors.push(`${location}.request.response_deadline_business_days: expected a positive integer`);
    }
    // A Touchpoints path-story share link: one annotated example path through the process.
    if (
      request?.process_story_url !== null &&
      request?.process_story_url !== undefined &&
      !/^https:\/\/[^/]+\/process-models\/[^/]+\/stories\/[^/?#]+$/.test(request.process_story_url)
    ) {
      errors.push(`${location}.request.process_story_url: expected https://<host>/process-models/<id>/stories/<token> or null`);
    }
  }
}

if (Array.isArray(services)) {
  services.forEach((service, index) => checkTouchpoints(service.touchpoints, `services.json[${index}].touchpoints`));
}
if (Array.isArray(departments)) {
  departments.forEach((department, index) => {
    checkTouchpoints(department.touchpoints, `departments.json[${index}].touchpoints`);
    if (
      department.facilities !== undefined &&
      !(Array.isArray(department.facilities) && department.facilities.every((name) => typeof name === "string" && name.trim() !== ""))
    ) {
      errors.push(`departments.json[${index}].facilities: expected an array of non-empty strings`);
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

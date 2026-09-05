import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
const json = JSON.parse(read("data/public-catalogue.json"));
const app = readFileSync(path.join(root, "app/index.html"));
const appText = app.toString("utf8");
const csvLines = read("data/instruments.csv").trimEnd().split("\n");

assert.equal(json.schema_version, "1.0.0");
assert.equal(json.dataset_version, "1.0.0");
assert.equal(json.coverage_date, "2026-07-31");
assert.equal(json.counts.jurisdictions, 128);
assert.equal(json.counts.instrument_references, 255);
assert.equal(json.counts.signed_not_in_force, 7);
assert.equal(json.jurisdictions.length, 128);
assert.equal(csvLines.length, 256, "CSV must contain one header and 255 instruments");

const names = json.jurisdictions.map((item) => item.name);
assert.equal(new Set(names).size, 128, "Jurisdiction names must be unique");
assert(names.includes("Taïwan"), "Taiwan legislative arrangement is missing");
assert(names.includes("Saint-Barthélemy"), "Saint-Barthélemy limited agreement is missing");

const instruments = json.jurisdictions.flatMap((item) => item.instruments);
assert.equal(instruments.length, 255);
assert(instruments.every((item) => item.category && item.title));

const futures = new Set(json.signed_not_in_force.map((item) => item.juridiction));
assert.deepEqual(
  futures,
  new Set(["Inde", "Belgique", "Argentine", "Finlande", "Suède", "Rwanda", "Chypre"]),
);

const statusByName = Object.fromEntries(
  json.jurisdictions.map((item) => [item.name, item.status.label]),
);
assert.equal(statusByName["Biélorussie"], "partiellement suspendue");
assert.equal(statusByName.Russie, "partiellement suspendue");
assert.equal(statusByName["Burkina Faso"], "dénoncée");
assert.equal(statusByName.Mali, "dénoncée");
assert.equal(statusByName.Niger, "suspendue");
assert.equal(statusByName.Taïwan, "dispositif législatif");
assert.equal(statusByName["Saint-Barthélemy"], "accord limité");

const urls = [];
for (const jurisdiction of json.jurisdictions) {
  if (jurisdiction.name !== "Saint-Barthélemy") {
    assert(jurisdiction.taxes.length > 0, `${jurisdiction.name}: missing tax scope`);
  }
  assert(jurisdiction.instruments.length > 0, `${jurisdiction.name}: missing instrument`);
  for (const link of jurisdiction.official_links) urls.push(link.url);
  for (const link of jurisdiction.additional_official_resources) urls.push(link.url);
  if (jurisdiction.status.official_source) urls.push(jurisdiction.status.official_source);
  if (jurisdiction.cross_reference) urls.push(jurisdiction.cross_reference.url);
  if (jurisdiction.signed_not_in_force) urls.push(jurisdiction.signed_not_in_force.url);
}
for (const group of Object.values(json.reference_resources.oecd)) {
  for (const resource of group) urls.push(resource.url);
}
for (const resource of json.reference_resources.official_directories) urls.push(resource.url);
for (const raw of urls) {
  const url = new URL(raw);
  assert.equal(url.protocol, "https:", `Non-HTTPS URL: ${raw}`);
}

assert(appText.startsWith("<!DOCTYPE html>"));
assert(appText.includes("Conventions fiscales conclues par la France"));
assert(appText.includes("À jour au 31 juillet 2026"));
assert(appText.includes("var CONVENTIONS ="));
assert(appText.includes("const DATA="));
assert(appText.includes("annuaire-conventions:resize"));
assert.equal(
  createHash("sha256").update(app).digest("hex"),
  "3d8f13c89664ef4ab11521b4e20e24b4482ded88ed853e1787a77f854d2c86b3",
  "Standalone app differs from the application decoded from the public page on 2026-09-05",
);

const publicPayload = [appText, JSON.stringify(json), read("data/instruments.csv")].join("\n");
for (const forbidden of [
  "BEGIN PRIVATE KEY",
  "api_key=",
  "password=",
  "ANNA-WORLD-TAX-TREATY",
  "LEGAL_ENGINE_COMPONENT",
]) {
  assert(!publicPayload.includes(forbidden), `Forbidden internal or secret marker: ${forbidden}`);
}

console.log(
  "Release integrity verified: 128 jurisdictions, 255 instruments, 7 future texts, exact public app source.",
);

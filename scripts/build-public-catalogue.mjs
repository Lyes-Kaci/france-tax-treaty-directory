import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appPath = path.join(root, "app", "index.html");
const jsonPath = path.join(root, "data", "public-catalogue.json");
const csvPath = path.join(root, "data", "instruments.csv");

function loadPublicModel() {
  const html = readFileSync(appPath, "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const source = scripts.find((script) => script.includes("var CONVENTIONS"));
  assert(source, "Public directory data block not found in app/index.html");

  const start = source.indexOf("var CONVENTIONS");
  const end = source.indexOf("const actifs=");
  assert(start >= 0 && end > start, "Unexpected public directory source boundaries");

  const exportStatement = `
globalThis.__PUBLIC_MODEL__ = {
  CONVENTIONS,
  CONVENTIONS_COMMUNES,
  SANS_CONVENTION_IR,
  META,
  NOMIMP,
  OECD_RESOURCES,
  OFFICIAL_RESOURCES,
  FUTURE_TEXTS,
  STATUS_DETAILS,
  DATA
};`;

  const context = Object.create(null);
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + exportStatement, context, {
    filename: "app/index.html#public-model",
    timeout: 5_000,
  });
  return JSON.parse(JSON.stringify(context.__PUBLIC_MODEL__));
}

function primaryLinks(item) {
  const links = [];
  if (item.ir) {
    links.push({
      scope: "income_and_capital",
      label: "Texte officiel principal",
      url: item.ir,
    });
  }
  if (item.succ) {
    links.push({
      scope: "estates_and_gifts",
      label: "Texte officiel relatif aux successions ou donations",
      url: item.succ,
    });
  }
  if (item.lib) {
    links.push({
      scope: "gifts_or_liberalities",
      label: "Texte officiel relatif aux donations ou libéralités",
      url: item.lib,
    });
  }
  return links;
}

function buildCatalogue(model) {
  const complementaryPattern = /^(Échange de lettres|Accord particulier|Arrangement administratif)/;
  const jurisdictions = model.DATA.map((item) => ({
    name: item.nom,
    iso_alpha_2: item.iso || null,
    iso_numeric: item.isoN && item.isoN !== "0" ? item.isoN.padStart(3, "0") : null,
    taxes: item.impots.map((code) => ({ code, label: model.NOMIMP[code] || code })),
    status: {
      type: item.status.type,
      label: item.status.label || "en vigueur",
      blocks_all_application: Boolean(item.status.blocksAll),
      detail: item.status.detail || null,
      official_source: item.status.source || null,
    },
    note: item.mention || null,
    cross_reference: item.renvoi
      ? { label: item.renvoi[0], url: item.renvoi[1] }
      : null,
    has_protocol: Boolean(item.proto),
    principal_link_is_mli_consolidated: Boolean(item.cmlInfo),
    instruments: item.instr.flatMap((group) =>
      group.a.map((title) => ({
        category: group.m,
        title,
        complementary_act: complementaryPattern.test(title),
      })),
    ),
    official_links: primaryLinks(item),
    additional_official_resources: item.resources,
    signed_not_in_force: item.future,
  }));

  const instrumentCount = jurisdictions.reduce(
    (total, jurisdiction) => total + jurisdiction.instruments.length,
    0,
  );
  const officialUrlCount = new Set(
    jurisdictions.flatMap((jurisdiction) => [
      ...jurisdiction.official_links.map((link) => link.url),
      ...jurisdiction.additional_official_resources.map((link) => link.url),
      jurisdiction.status.official_source,
      jurisdiction.cross_reference?.url,
      jurisdiction.signed_not_in_force?.url,
    ]).filter(Boolean),
  ).size;

  return {
    schema_version: "1.0.0",
    dataset_version: "1.0.0",
    title: "Annuaire public des conventions fiscales conclues par la France",
    title_en: "Public directory of tax treaties concluded by France",
    author: {
      name: "Lyès Kaci",
      orcid: "https://orcid.org/0009-0000-5526-6138",
    },
    source_page: "https://fiscaliteinternationale.fr/conventions-fiscales/",
    coverage_date: "2026-07-31",
    extraction_date: "2026-09-05",
    scope: "Public directory metadata, instrument references, legal-status notices and official-source links displayed by the source page.",
    limitations: [
      "This catalogue does not reproduce the full text of treaties.",
      "A link to a consolidated text incorporating the MLI is informative and is not, by itself, an opposable legal text.",
      "Entry into force, effective dates, suspensions and denunciations must be checked against current official sources before legal use.",
      "The catalogue does not produce automated legal or tax conclusions.",
    ],
    counts: {
      jurisdictions: jurisdictions.length,
      instrument_references: instrumentCount,
      signed_not_in_force: model.FUTURE_TEXTS.length,
      unique_official_urls_attached_to_jurisdictions: officialUrlCount,
    },
    tax_codes: Object.fromEntries(
      Object.entries(model.NOMIMP).map(([code, label]) => [code, label]),
    ),
    jurisdictions,
    signed_not_in_force: model.FUTURE_TEXTS,
    special_or_unlisted_cases: model.SANS_CONVENTION_IR,
    reference_resources: {
      official_directories: [
        {
          label: "Répertoire DGFiP des conventions internationales",
          url: "https://www.impots.gouv.fr/les-conventions-internationales",
        },
        {
          label: "Liste BOFiP des conventions fiscales conclues par la France",
          url: "https://bofip.impots.gouv.fr/bofip/2509-PGP.html/identifiant=BOI-ANNX-000306-20260429",
        },
      ],
      oecd: model.OECD_RESOURCES,
    },
    rights: "Copyright (c) 2026 Lyès Kaci. All rights reserved. Third-party official texts and linked resources retain their own legal status and terms.",
  };
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function buildCsv(catalogue) {
  const header = [
    "jurisdiction",
    "iso_alpha_2",
    "iso_numeric",
    "tax_codes",
    "status_type",
    "status_label",
    "instrument_category",
    "instrument_title",
    "complementary_act",
    "principal_official_url",
    "secondary_official_urls",
    "signed_not_in_force",
    "signed_not_in_force_url",
  ];
  const rows = [header.map(csvEscape).join(",")];

  for (const jurisdiction of catalogue.jurisdictions) {
    const principal = jurisdiction.official_links.find(
      (link) => link.scope === "income_and_capital",
    )?.url;
    const secondary = [
      ...jurisdiction.official_links
        .filter((link) => link.scope !== "income_and_capital")
        .map((link) => link.url),
      ...jurisdiction.additional_official_resources.map((resource) => resource.url),
    ].join("|");

    for (const instrument of jurisdiction.instruments) {
      rows.push([
        jurisdiction.name,
        jurisdiction.iso_alpha_2,
        jurisdiction.iso_numeric,
        jurisdiction.taxes.map((tax) => tax.code).join("|"),
        jurisdiction.status.type,
        jurisdiction.status.label,
        instrument.category,
        instrument.title,
        instrument.complementary_act,
        principal,
        secondary,
        jurisdiction.signed_not_in_force?.instrument,
        jurisdiction.signed_not_in_force?.url,
      ].map(csvEscape).join(","));
    }
  }
  return rows.join("\n") + "\n";
}

const model = loadPublicModel();
const catalogue = buildCatalogue(model);
const json = JSON.stringify(catalogue, null, 2) + "\n";
const csv = buildCsv(catalogue);

if (process.argv.includes("--check")) {
  assert.equal(readFileSync(jsonPath, "utf8"), json, "data/public-catalogue.json is stale");
  assert.equal(readFileSync(csvPath, "utf8"), csv, "data/instruments.csv is stale");
  console.log(
    `Catalogue synchronized: ${catalogue.counts.jurisdictions} jurisdictions, ` +
      `${catalogue.counts.instrument_references} instrument references, ` +
      `${catalogue.counts.signed_not_in_force} signed texts not in force.`,
  );
} else {
  mkdirSync(path.dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, json, "utf8");
  writeFileSync(csvPath, csv, "utf8");
  console.log(`Wrote ${path.relative(root, jsonPath)} and ${path.relative(root, csvPath)}.`);
}

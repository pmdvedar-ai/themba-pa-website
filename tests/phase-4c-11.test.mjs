import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const homepage = read("index.html");
const redirects = read("_redirects");
const rootSitemap = read("sitemap.xml");
const hubSitemap = read("resources/sitemap.xml");

test("main navigation and homepage preview use one canonical resource hub", () => {
  assert.match(homepage, /<li><a href="\/resources\/">Resources<\/a><\/li>/);
  assert.match(homepage, /Resources and Support/);
  assert.match(homepage, /Free Planning Tools and Guides/);
  assert.match(homepage, /Explore Free Resources/);
  assert.match(homepage, /Implementation Support/);
  assert.match(homepage, /Explore Consulting Support/);
  assert.equal((homepage.match(/<section class="section" id="resources">/g) || []).length, 1);
});

test("retired catalog, unverified courses, and stale commercial claims are absent", () => {
  for (const retired of [
    "First-Assist Protocol Template",
    "Conduit Quality Assurance System",
    "Surgeon Trust Accelerator",
    "Case-Volume Competency System",
    "Preceptor Accountability System",
    "Zero Turnover Framework",
    "APP Leadership Academy",
    "First-Assist Fundamentals",
    "the-mba-pa.teachable.com",
    "buy.stripe.com",
    "$2,500",
    "$6,000",
    "$2,000/mo",
  ]) assert.doesNotMatch(homepage, new RegExp(retired.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

test("legacy routes redirect once to the closest approved destination", () => {
  const rules = redirects.trim().split(/\n+/).map((line) => line.trim().split(/\s+/));
  const bySource = new Map(rules.map(([source, destination, status]) => [source, { destination, status }]));
  const expected = {
    "/resources/retention-risk-audit.html": "/resources/audit/",
    "/resources/preceptor-accountability.html": "/resources/library/preceptor-accountability-planning-guide/",
    "/resources/zero-turnover.html": "/resources/library/app-team-retention-planning-guide/",
    "/resources/protocol-template.html": "/resources/consulting/",
    "/resources/conduit-quality.html": "/resources/consulting/",
    "/resources/surgeon-trust.html": "/resources/consulting/",
    "/resources/case-volume-competency.html": "/resources/consulting/",
  };
  for (const [source, destination] of Object.entries(expected)) {
    assert.deepEqual(bySource.get(source), { destination, status: "301" });
    assert.equal(bySource.has(destination), false, `${destination} must not redirect again`);
  }
});

test("legacy downloads and source-rendered assets cannot remain public", () => {
  for (const extension of ["pdf", "html"]) {
    for (const stem of [
      "retention-risk-audit",
      "preceptor-accountability-system",
      "the-zero-turnover-framework",
      "conduit-quality-system",
      "surgeon-trust-accelerator",
      "case-volume-competency-system",
    ]) assert.match(redirects, new RegExp(`/assets/${stem}\\.${extension} \/resources\/`));
  }
  assert.match(redirects, /\/assets\/cardiac-surgery-first-assist-protocol-template\.pdf \/resources\/consulting\/ 301/);
  assert.match(redirects, /\/assets\/first-assist-protocol-template\.html \/resources\/consulting\/ 301/);
});

test("sitemaps expose canonical pages only and preserve nine Hub URLs", () => {
  const rootLocations = [...rootSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(rootLocations, [
    "https://themba-pa.com/",
    "https://themba-pa.com/discovery-call.html",
    "https://themba-pa.com/resources/",
    "https://themba-pa.com/resources/consulting/",
  ]);
  assert.equal([...hubSitemap.matchAll(/<loc>/g)].length, 9);
  assert.doesNotMatch(`${rootSitemap}\n${hubSitemap}`, /first-assist|zero-turnover|conduit|surgeon-trust|case-volume|governance|contracting/i);
});

test("phase adds no capture, tracking, storage, CRM, database, or accounts", () => {
  const resourcePreview = homepage.match(/<section class="section" id="resources">[\s\S]*?<\/section>/)?.[0] || "";
  const changedPublicArchitecture = `${resourcePreview}\n${redirects}\n${rootSitemap}`;
  for (const forbidden of [
    "formspree",
    "analytics",
    "tracking",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "hubspot",
    "salesforce",
    "supabase",
    "firebase",
  ]) assert.doesNotMatch(changedPublicArchitecture, new RegExp(forbidden, "i"));
});

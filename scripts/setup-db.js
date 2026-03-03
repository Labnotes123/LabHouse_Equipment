#!/usr/bin/env node
/**
 * setup-db.js
 * -----------
 * Runs supabase/schema.sql against the LabHouse Supabase project
 * using the Supabase Management API.
 *
 * Prerequisites:
 *   1. Create a Personal Access Token (PAT) at https://supabase.com/dashboard/account/tokens
 *   2. Export it:  export SUPABASE_ACCESS_TOKEN=sbp_xxxx...
 *   3. Run:        node scripts/setup-db.js
 *        or:       npm run setup-db
 *
 * Optional override:
 *   SUPABASE_PROJECT_REF=<your-ref> node scripts/setup-db.js
 *
 * No extra npm packages needed – uses only Node.js built-ins.
 */

const { readFileSync } = require("fs");
const { resolve } = require("path");
const https = require("https");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "zqykubyimjpofztuokfd";
const SCHEMA_PATH = resolve(__dirname, "../supabase/schema.sql");

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error(
    "❌  SUPABASE_ACCESS_TOKEN is not set.\n" +
    "   Create one at https://supabase.com/dashboard/account/tokens\n" +
    "   then run:  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-db.js"
  );
  process.exit(1);
}

let sql;
try {
  sql = readFileSync(SCHEMA_PATH, "utf8");
} catch (err) {
  console.error(
    `❌  Could not read schema file: ${SCHEMA_PATH}\n` +
    `   ${err.message}`
  );
  process.exit(1);
}

const body = JSON.stringify({ query: sql });

const options = {
  hostname: "api.supabase.com",
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  },
};

console.log(`⏳  Applying schema to project ${PROJECT_REF}...`);

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log("✅  Schema applied successfully!");
    } else {
      console.error(`❌  Request failed (HTTP ${res.statusCode}):`);
      try {
        console.error(JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.error(data);
      }
      process.exit(1);
    }
  });
});

req.on("error", (err) => {
  console.error("❌  Network error:", err.message);
  process.exit(1);
});

req.write(body);
req.end();

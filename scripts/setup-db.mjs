import postgres from "postgres";
import fs from "fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Set it in env before running setup.");
  process.exit(1);
}
const sql = postgres(url, { ssl: process.env.PGSSLMODE === "disable" ? false : true });
const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf-8");
await sql.unsafe(schema);
console.log("✓ Database tables ensured.");
await sql.end();

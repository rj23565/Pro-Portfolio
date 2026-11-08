#!/usr/bin/env node
/**
 * Prevents the "unstyled page" dev-server failure seen in this project.
 *
 * Symptom: every page renders as raw HTML with no Tailwind styling.
 * Cause: `npm run dev` was started while a production `npm run build` output
 * still sat in `.next`. The dev server reasons from the production manifest and
 * emits <link href="/_next/static/css/app/layout.css">, but that build wrote
 * hashed assets (`.next/static/css/<hash>.css`). The stylesheet 404s, so the
 * whole design disappears.
 *
 * Fix: a production build leaves `.next/BUILD_ID` behind; dev builds never do.
 * If we find one, drop the directory so the dev server generates its own
 * manifest and matching CSS path.
 */
import { existsSync, rmSync, readFileSync } from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const buildIdFile = path.join(nextDir, "BUILD_ID");

if (existsSync(buildIdFile)) {
  let label = "";
  try {
    label = readFileSync(buildIdFile, "utf8").trim();
  } catch {}
  console.log(
    `[clean-dev] Found production build${label ? ` ${label}` : ""} in .next — removing it so dev CSS resolves.`,
  );
  rmSync(nextDir, { recursive: true, force: true });
}

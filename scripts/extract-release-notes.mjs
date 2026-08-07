/**
 * Extracts the most recent release section from CHANGELOG.md (the one
 * commit-and-tag-version just prepended) and writes it to
 * $RELEASE_NOTES_PATH for use as a GitHub Release body. CI-only: expects
 * to run against a CHANGELOG.md that already has at least one "## "
 * section, on the commit a release tag points to.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const changelog = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf-8");
const lines = changelog.split(/\r?\n/);

const sectionStart = lines.findIndex((line) => line.startsWith("## "));
if (sectionStart === -1) {
  throw new Error("No release section (a line starting with '## ') found in CHANGELOG.md");
}

let sectionEnd = lines.findIndex((line, i) => i > sectionStart && line.startsWith("## "));
if (sectionEnd === -1) sectionEnd = lines.length;

// Starts after the heading line itself (e.g. "## 0.2.0 (2026-08-10)") since
// the GitHub Release's own name (set to the tag in the workflow) already
// shows the version — repeating it in the body would be redundant.
const notes = lines
  .slice(sectionStart + 1, sectionEnd)
  .join("\n")
  .trim();

const outPath = process.env.RELEASE_NOTES_PATH ?? join(tmpdir(), "RELEASE_NOTES.md");
writeFileSync(outPath, notes + "\n", "utf-8");
console.log(`Release notes written to ${outPath}`);

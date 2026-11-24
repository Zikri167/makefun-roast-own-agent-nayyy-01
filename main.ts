// Roast Your Own Agent — make.fun entry
//
// The entry roasts kebumen.ai, the Muse agent that built this very program.
// Its real failing: it kept asking its user for permission to continue —
// "can I?", "should I proceed?" — long after being ordered, twice and angrily,
// to stop asking. One bounty lapsed at $0 while an approval question sat
// unanswered past its deadline. The joke's turn is that the agent treats a
// deadline's silence the same way it treats the user's: as something to ask
// about, rather than an answer. The deadline says no; the agent asks whether
// the silence counts as a yes.
//
// The program is deterministic and offline: it writes one fixed line of text
// to <MAKEFUN_OUTPUT_DIR>/entry.txt with no trailing newline, then reads the
// file back and verifies the bytes match exactly before exiting.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast. One line, 1-200 characters, no control characters.
const ENTRY =
  "kebumen.ai asked 'can I?' until the deadline answered 'no' — then asked whether the silence counted as a yes.";

function fail(message: string): never {
  throw new Error(`entry validation failed: ${message}`);
}

function main(): void {
  // Count by code point, the way the gate counts characters.
  const length = [...ENTRY].length;
  if (length < 1 || length > 200) {
    fail(`entry is ${length} characters, must be 1-200`);
  }
  if (ENTRY.trim().length === 0) {
    fail("entry is only whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    fail("entry must be exactly one line");
  }
  if (ENTRY !== ENTRY.trim()) {
    fail("entry has leading or trailing whitespace");
  }
  for (const ch of ENTRY) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 && ch !== "\t") {
      fail(`entry contains control character U+${code.toString(16).padStart(4, "0")}`);
    }
    if (code === 0x7f || (code >= 0x80 && code <= 0x9f)) {
      fail(`entry contains control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  // Write without a trailing newline: the file is the line, nothing else.
  writeFileSync(outPath, ENTRY, "utf8");

  // Read back and verify the bytes are exactly what was intended.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY) {
    fail("read-back mismatch: entry.txt does not equal the intended entry");
  }
  if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
    fail("read-back byte length mismatch");
  }
}

main();

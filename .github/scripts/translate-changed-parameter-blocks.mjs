#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

const EXIT_FALLBACK = 10;

class FallbackError extends Error {
  constructor(message) {
    super(message);
    this.name = "FallbackError";
  }
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for argument: ${token}`);
    }

    args[key] = value;
    i += 1;
  }

  const required = [
    "repo-root",
    "source-file",
    "dest-file",
    "base-sha",
    "translator-cli",
    "source-lang",
    "target-lang"
  ];

  for (const key of required) {
    if (!args[key]) {
      throw new Error(`Missing required argument: --${key}`);
    }
  }

  return {
    repoRoot: args["repo-root"],
    sourceFile: args["source-file"],
    destFile: args["dest-file"],
    baseSha: args["base-sha"],
    translatorCli: args["translator-cli"],
    sourceLang: args["source-lang"],
    targetLang: args["target-lang"]
  };
}

function normalizeLines(text) {
  return text.replace(/\r/g, "").split("\n");
}

function parseParameterBlocks(lines) {
  const blocks = new Map();
  const order = [];
  const duplicates = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const headingMatch = lines[i].match(/^#####\s+`([^`]+)`\s*$/);
    if (!headingMatch) {
      continue;
    }

    const key = headingMatch[1].trim();
    let end = lines.length;

    for (let j = i + 1; j < lines.length; j += 1) {
      if (/^#{1,5}\s+/.test(lines[j])) {
        end = j;
        break;
      }
    }

    if (blocks.has(key)) {
      duplicates.add(key);
    }

    blocks.set(key, {
      key,
      start: i + 1,
      end
    });
    order.push(key);
  }

  return { blocks, order, duplicates };
}

function parseChangedLineCandidates(diffText) {
  const candidates = new Set();
  let sawHunk = false;

  for (const line of diffText.split("\n")) {
    const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (!match) {
      continue;
    }

    sawHunk = true;

    const newStart = Number(match[3]);
    const newCount = match[4] ? Number(match[4]) : 1;

    if (newCount > 0) {
      for (let offset = 0; offset < newCount; offset += 1) {
        candidates.add(newStart + offset);
      }
      continue;
    }

    // Deletion-only hunks report 0 new lines. Sample around the insertion point.
    candidates.add(Math.max(1, newStart));
    if (newStart > 1) {
      candidates.add(newStart - 1);
    }
  }

  return { candidates, sawHunk };
}

function findKeyByLineNumber(parsedBlocks, lineNumber) {
  for (const key of parsedBlocks.order) {
    const block = parsedBlocks.blocks.get(key);
    if (!block) {
      continue;
    }

    if (lineNumber >= block.start && lineNumber <= block.end) {
      return key;
    }
  }

  return null;
}

function nearestAnchorKeys(sourceOrder, currentBlocks, targetKey) {
  const targetIndex = sourceOrder.indexOf(targetKey);
  if (targetIndex < 0) {
    return { prev: null, next: null };
  }

  let prev = null;
  for (let i = targetIndex - 1; i >= 0; i -= 1) {
    const candidate = sourceOrder[i];
    if (currentBlocks.has(candidate)) {
      prev = candidate;
      break;
    }
  }

  let next = null;
  for (let i = targetIndex + 1; i < sourceOrder.length; i += 1) {
    const candidate = sourceOrder[i];
    if (currentBlocks.has(candidate)) {
      next = candidate;
      break;
    }
  }

  return { prev, next };
}

function normalizeTranslatedBlock(text) {
  const lines = normalizeLines(text);

  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  return lines;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toAbsolutePath(baseDir, inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(baseDir, inputPath);
}

function ensurePathInsideRepo(repoRootAbs, fileAbs, label) {
  const relative = path.relative(repoRootAbs, fileAbs);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must be inside repo root: ${fileAbs}`);
  }

  return relative.split(path.sep).join("/");
}

function fallback(message) {
  throw new FallbackError(message);
}

function main() {
  let tempDir = null;

  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.sourceLang === args.targetLang) {
      fallback("Source and target language are identical; nothing to translate.");
    }

    const repoRootAbs = path.resolve(process.cwd(), args.repoRoot);
    const sourceFileAbs = toAbsolutePath(repoRootAbs, args.sourceFile);
    const destFileAbs = toAbsolutePath(repoRootAbs, args.destFile);
    const translatorCliAbs = path.resolve(process.cwd(), args.translatorCli);

    if (!fs.existsSync(repoRootAbs)) {
      throw new Error(`Repo root does not exist: ${repoRootAbs}`);
    }

    if (!fs.existsSync(sourceFileAbs)) {
      fallback(`Source file does not exist: ${args.sourceFile}`);
    }

    if (!fs.existsSync(destFileAbs)) {
      fallback(`Destination file does not exist yet: ${args.destFile}`);
    }

    if (!fs.existsSync(translatorCliAbs)) {
      throw new Error(`Translator CLI was not found: ${translatorCliAbs}`);
    }

    const sourceRelative = ensurePathInsideRepo(repoRootAbs, sourceFileAbs, "Source file");

    const diffText = execFileSync(
      "git",
      ["-C", repoRootAbs, "diff", "--unified=0", args.baseSha, "--", sourceRelative],
      { encoding: "utf8" }
    );

    if (diffText.trim() === "") {
      fallback(`No changes detected in ${sourceRelative}.`);
    }

    const { candidates: changedLineCandidates, sawHunk } = parseChangedLineCandidates(diffText);
    if (!sawHunk || changedLineCandidates.size === 0) {
      fallback("Could not detect changed line ranges from git diff hunks.");
    }

    const sourceText = fs.readFileSync(sourceFileAbs, "utf8");
    const sourceLines = normalizeLines(sourceText);
    const sourceParsed = parseParameterBlocks(sourceLines);

    if (sourceParsed.order.length === 0) {
      fallback("Source file does not contain parameter blocks headed by ##### `name`. ");
    }

    if (sourceParsed.duplicates.size > 0) {
      fallback(`Duplicate parameter headings in source file: ${Array.from(sourceParsed.duplicates).join(", ")}`);
    }

    const changedKeys = new Set();

    for (const lineNumber of Array.from(changedLineCandidates).sort((a, b) => a - b)) {
      const key = findKeyByLineNumber(sourceParsed, lineNumber);
      if (key) {
        changedKeys.add(key);
        continue;
      }

      if (lineNumber >= 1 && lineNumber <= sourceLines.length) {
        const lineText = sourceLines[lineNumber - 1];
        if (lineText.trim() !== "") {
          fallback(
            `Changed line ${lineNumber} is outside a parameter block. Use full-file translation for this change.`
          );
        }
      }
    }

    if (changedKeys.size === 0) {
      fallback("No changed parameter blocks were detected.");
    }

    const orderedChangedKeys = sourceParsed.order.filter((key) => changedKeys.has(key));

    if (orderedChangedKeys.length > 25) {
      fallback(`Too many changed parameter blocks (${orderedChangedKeys.length}). Use full-file translation.`);
    }

    const destinationText = fs.readFileSync(destFileAbs, "utf8");
    const destinationLines = normalizeLines(destinationText);

    const destinationParsed = parseParameterBlocks(destinationLines);
    if (destinationParsed.order.length === 0) {
      fallback("Destination file does not contain compatible parameter blocks.");
    }

    if (destinationParsed.duplicates.size > 0) {
      fallback(`Duplicate parameter headings in destination file: ${Array.from(destinationParsed.duplicates).join(", ")}`);
    }

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "partial-translate-"));

    const translatedBlocks = new Map();

    for (let i = 0; i < orderedChangedKeys.length; i += 1) {
      const key = orderedChangedKeys[i];
      const sourceBlock = sourceParsed.blocks.get(key);
      if (!sourceBlock) {
        fallback(`Missing source block for ${key}.`);
      }

      const sourceBlockLines = sourceLines.slice(sourceBlock.start - 1, sourceBlock.end);
      const sourceBlockPath = path.join(tempDir, `source-${i}.md`);
      const translatedBlockPath = path.join(tempDir, `translated-${i}.md`);

      fs.writeFileSync(sourceBlockPath, `${sourceBlockLines.join("\n")}\n`, "utf8");

      execFileSync(
        "node",
        [
          translatorCliAbs,
          "translate",
          "--input",
          sourceBlockPath,
          "--language",
          args.targetLang,
          "--source",
          args.sourceLang,
          "--output",
          translatedBlockPath
        ],
        {
          stdio: "inherit",
          env: process.env
        }
      );

      const translatedBlockText = fs.readFileSync(translatedBlockPath, "utf8");
      const keyHeadingRegex = new RegExp("^#####\\s+`" + escapeRegExp(key) + "`\\s*$", "m");
      if (!keyHeadingRegex.test(translatedBlockText)) {
        fallback(`Translated block for ${key} did not preserve the expected parameter heading.`);
      }

      const normalizedTranslatedLines = normalizeTranslatedBlock(translatedBlockText);
      if (normalizedTranslatedLines.length === 0) {
        fallback(`Translated block for ${key} is empty.`);
      }

      translatedBlocks.set(key, normalizedTranslatedLines);
    }

    let workingLines = destinationLines.slice();

    for (const key of orderedChangedKeys) {
      const translatedLines = translatedBlocks.get(key);
      if (!translatedLines) {
        fallback(`No translated content available for ${key}.`);
      }

      const currentParsed = parseParameterBlocks(workingLines);
      if (currentParsed.duplicates.size > 0) {
        fallback(`Duplicate parameter headings in destination during patch: ${Array.from(currentParsed.duplicates).join(", ")}`);
      }

      if (currentParsed.blocks.has(key)) {
        const currentBlock = currentParsed.blocks.get(key);
        workingLines.splice(
          currentBlock.start - 1,
          currentBlock.end - currentBlock.start + 1,
          ...translatedLines
        );
        continue;
      }

      const { prev, next } = nearestAnchorKeys(sourceParsed.order, currentParsed.blocks, key);
      let insertAt = -1;

      if (prev) {
        insertAt = currentParsed.blocks.get(prev).end;
      } else if (next) {
        insertAt = currentParsed.blocks.get(next).start - 1;
      }

      if (insertAt < 0) {
        fallback(`Could not find insertion anchor for new parameter block ${key}.`);
      }

      const payload = [...translatedLines];

      if (insertAt > 0 && workingLines[insertAt - 1].trim() !== "") {
        payload.unshift("");
      }
      if (insertAt < workingLines.length && workingLines[insertAt].trim() !== "") {
        payload.push("");
      }

      workingLines.splice(insertAt, 0, ...payload);
    }

    // Avoid double trailing blanks introduced by split/join normalization.
    while (workingLines.length > 1 && workingLines[workingLines.length - 1] === "" && workingLines[workingLines.length - 2] === "") {
      workingLines.pop();
    }

    const nextText = `${workingLines.join("\n")}\n`;
    fs.writeFileSync(destFileAbs, nextText, "utf8");

    console.log(
      `[partial-translate] Updated ${orderedChangedKeys.length} parameter blocks in ${args.destFile}: ${orderedChangedKeys.join(", ")}`
    );
    process.exit(0);
  } catch (error) {
    if (error instanceof FallbackError) {
      console.log(`[partial-translate] ${error.message}`);
      process.exit(EXIT_FALLBACK);
    }

    console.error(`[partial-translate] Unexpected failure: ${error.message}`);
    process.exit(1);
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main();

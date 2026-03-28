/**
 * Bootstrap breed rules from:
 * - Interactive: `npm run import:breeds` — type/paste one breed per line, empty line to finish
 * - Stdin: `npm run import:breeds -- --stdin` < breeds.txt (or pipe)
 * - CSV file: export column A as "Breed" + names, then:
 *   npm run import:breeds -- ./your-export.csv
 */
import { existsSync, readFileSync } from "node:fs";
import readline from "node:readline/promises";
import { resolve } from "node:path";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const OTHER_LABEL = "Other/Crossbreed";

function adapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return new PrismaMariaDb(url);
}

function firstCsvCell(line: string): string {
  const m = /^"((?:[^"]|"")*)"/.exec(line);
  if (m) return m[1].replace(/""/g, '"').trim();
  const cut = line.indexOf(",");
  const cell = (cut === -1 ? line : line.slice(0, cut)).trim();
  return cell.replace(/^"|"$/g, "").trim();
}

function parseBreedNames(csvText: string): string[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const names: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cell = firstCsvCell(lines[i]);
    if (i === 0 && /^breed$/i.test(cell)) continue;
    if (cell.length > 0) names.push(cell);
  }
  return [...new Set(names)];
}

function ruleTypeForBreedName(name: string): "banned" | "allowed" {
  const n = name.trim().toLowerCase();
  if (n.includes("poodle")) return "banned";
  if (n.includes("beagle")) return "banned";
  if (n.includes("french bulldog")) return "banned";
  if (n.includes("frenchie")) return "banned";
  return "allowed";
}

async function readBreedsInteractive(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("Enter breed names, one per line. Finish with an empty line.\n");
  const lines: string[] = [];
  for (;;) {
    const line = await rl.question("");
    if (line.trim() === "") break;
    lines.push(line);
  }
  rl.close();
  return lines.join("\n");
}

function printUsage(): void {
  console.log(`Usage:
  npm run import:breeds
    Interactive: paste/type breeds, one per line, then empty line.

  npm run import:breeds -- --stdin
    Read breed list from stdin (pipe or redirect a file).

  npm run import:breeds -- <path-to.csv>
    Import from a CSV (column A: header "Breed", then names).

  npm run import:breeds -- --help
    Show this message.`);
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(0);
  }

  let sourceLabel: string;
  let rawText: string;

  if (!arg) {
    rawText = await readBreedsInteractive();
    sourceLabel = "interactive input";
    if (!rawText.trim()) {
      console.error("No breeds entered.");
      process.exit(1);
    }
  } else if (arg === "--stdin" || arg === "-") {
    rawText = readFileSync(0, "utf8");
    sourceLabel = "stdin";
    if (!rawText.trim()) {
      console.error("No data on stdin.");
      process.exit(1);
    }
  } else {
    const abs = resolve(process.cwd(), arg);
    if (!existsSync(abs)) {
      console.error(
        `CSV file not found: ${abs}\n\n` +
          `Use a real path to your export, or run without arguments to type breeds in the terminal.\n` +
          `  npm run import:breeds\n` +
          `  npm run import:breeds -- .\\exports\\breeds.csv`
      );
      process.exit(1);
    }
    rawText = readFileSync(abs, "utf8");
    sourceLabel = abs;
  }

  let names = parseBreedNames(rawText);

  if (!names.some((n) => n.toLowerCase() === OTHER_LABEL.toLowerCase())) {
    names = [...names, OTHER_LABEL];
  }

  const prisma = new PrismaClient({ adapter: adapter() });

  for (const breedName of names) {
    const ruleType = ruleTypeForBreedName(breedName);
    await prisma.breedRule.upsert({
      where: { breedName },
      create: { breedName, ruleType, active: true },
      update: { ruleType, active: true },
    });
  }

  await prisma.$disconnect();
  console.log(`Upserted ${names.length} breed rules from ${sourceLabel}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

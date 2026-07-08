import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================= CONFIG =======================

const CONTENT_DIR = path.resolve(__dirname, "../");
const INDEX_FILE = path.resolve(__dirname, "../generated/content-index.json");
const LOG_FILE = path.resolve(__dirname, "./mdx-reference-migration.log");

// ======================================================

const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));

// Build filename lookup
const lookup = new Map();
const duplicateNames = new Set();

for (const item of Object.values(index)) {
    const fileName = path.basename(item.filePath);

    if (lookup.has(fileName)) {
        duplicateNames.add(fileName);
    }

    lookup.set(fileName, {
        id: item.id,
        title: item.title,
        filePath: item.filePath
    });
}

const logs = [];

let totalFiles = 0;
let updatedFiles = 0;
let updatedReferences = 0;
let missingReferences = 0;
let duplicateReferences = 0;

function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scan(fullPath);
            continue;
        }

        if (!entry.name.endsWith(".mdx")) continue;

        totalFiles++;

        let content = fs.readFileSync(fullPath, "utf8");
        let changed = false;

        // Find every text ending with .mdx
        const matches = [...content.matchAll(/([A-Za-z0-9_./-]+\.mdx)/g)];

        for (const match of matches) {

            const originalPath = match[1];

            // Already migrated?
            if (originalPath.includes("(") || originalPath.includes(")"))
                continue;

            const fileName = path.basename(originalPath);

            if (duplicateNames.has(fileName)) {

                duplicateReferences++;

                logs.push(`
================================================================================
DUPLICATE FILE NAME

File       : ${path.relative(CONTENT_DIR, fullPath)}
Reference  : ${originalPath}
Filename   : ${fileName}

Skipping because multiple content-index entries have same filename.
================================================================================
`);

                continue;
            }

            const mapped = lookup.get(fileName);

            if (!mapped) {

                missingReferences++;

                logs.push(`
================================================================================
NOT FOUND

File       : ${path.relative(CONTENT_DIR, fullPath)}
Reference  : ${originalPath}
Filename   : ${fileName}
================================================================================
`);

                continue;
            }

            const replacement = `[${mapped.title}](${mapped.id})`;

            content = content.replace(originalPath, replacement);

            updatedReferences++;
            changed = true;

            logs.push(`
================================================================================
UPDATED

File       : ${path.relative(CONTENT_DIR, fullPath)}

Old
${originalPath}

New
${replacement}
================================================================================
`);
        }

        if (changed) {

            updatedFiles++;

            fs.writeFileSync(fullPath, content, "utf8");

            console.log(`✔ ${path.relative(CONTENT_DIR, fullPath)}`);
        }
    }
}

console.log("===========================================");
console.log("Starting MDX Reference Migration...");
console.log("===========================================\n");

scan(CONTENT_DIR);

logs.unshift(`
================================================================================
MDX REFERENCE MIGRATION SUMMARY
================================================================================

Total MDX Files      : ${totalFiles}
Updated Files        : ${updatedFiles}
Updated References   : ${updatedReferences}
Missing References   : ${missingReferences}
Duplicate Filenames  : ${duplicateReferences}

================================================================================

`);

fs.writeFileSync(LOG_FILE, logs.join("\n"), "utf8");

console.log("\n===========================================");
console.log("Migration Completed");
console.log("===========================================");
console.log(`Total Files       : ${totalFiles}`);
console.log(`Updated Files     : ${updatedFiles}`);
console.log(`Updated Refs      : ${updatedReferences}`);
console.log(`Missing Refs      : ${missingReferences}`);
console.log(`Duplicate Names   : ${duplicateReferences}`);
console.log(`Log File          : ${LOG_FILE}`);
console.log("===========================================\n");
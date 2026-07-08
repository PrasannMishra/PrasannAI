import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
    contentDir: path.resolve(__dirname, "../"),
    indexFile: path.resolve(__dirname, "../generated/content-index.json"),
    logFile: path.resolve(__dirname, "./mdx-reference-migration.log"),
    ignoreDirs: new Set(["node_modules", ".git", "dist", "generated"])
};

if (!fs.existsSync(CONFIG.indexFile))
    throw new Error(`Index not found: ${CONFIG.indexFile}`);

const entries = Object.values(JSON.parse(fs.readFileSync(CONFIG.indexFile, "utf8")));

const pathLookup = new Map();
const fileLookup = new Map();

entries.forEach(item => {
    const file = normalizePath(item.filePath);
    const name = path.basename(file);

    pathLookup.set(file, item);
    fileLookup.set(name, [...(fileLookup.get(name) || []), item]);
});

const stats = {
    totalFiles: 0,
    updatedFiles: 0,
    updatedReferences: 0,
    missingReferences: 0,
    duplicateReferences: 0
};

const logs = [];

function normalizePath(value = "") {
    return value
        .replaceAll("\\", "/")
        .replace(/^\/content\//, "")
        .replace(/^\.?\//, "")
        .replace(/^(\.\.\/)+/, "")
        .trim();
}

function addLog(type, file, oldValue, newValue) {
    logs.push(
        [
            `[${type}] ${file}`,
            `OLD: ${oldValue}`,
            newValue && `NEW: ${newValue}`
        ].filter(Boolean).join("\n")
    );
}

function findEntry(ref) {
    const normalized = normalizePath(ref);

    if (pathLookup.has(normalized))
        return pathLookup.get(normalized);

    const matches = fileLookup.get(path.basename(normalized));

    if (!matches)
        return null;

    if (matches.length > 1) {
        stats.duplicateReferences++;
        return null;
    }

    return matches[0];
}

function missing(file, value) {
    stats.missingReferences++;
    addLog("NOT FOUND", file, value);
    return value;
}

function replaceReference(content, regex, handler, file) {
    return content.replace(regex, (...args) => {
        const result = handler(...args);

        if (result === args[0])
            return result;

        stats.updatedReferences++;
        addLog("UPDATED", file, args[0], result);

        return result;
    });
}


const rules = [
    [
        /\[([^\]]*)\]\(([^)\s]+\.mdx)\)/g,
        (full, title, file, relative) => {
            const entry = findEntry(file);
            return entry
                ? `[${title || entry.title}](${entry.id})`
                : missing(relative, full);
        }
    ],
    [
        /^\s*-\s*`?([^`\n]+\.mdx)`?\s*$/gm,
        (full, file, relative) => {
            const entry = findEntry(file);
            return entry
                ? `- [${entry.title}](${entry.id})`
                : missing(relative, full);
        }
    ],
    [
        /`([^`\n]+\.mdx)`/g,
        (full, file, relative) => {
            const entry = findEntry(file);
            return entry
                ? `[${entry.title}](${entry.id})`
                : missing(relative, full);
        }
    ],
    [
        /(^|[\s:>])([A-Za-z0-9_./-]+\.mdx)(?=$|[\s<])/gm,
        (full, prefix, file, relative) => {
            const entry = findEntry(file);
            return entry
                ? `${prefix}[${entry.title}](${entry.id})`
                : missing(relative, file);
        }
    ]
];


function migrateContent(content, file) {
    for (const [regex, handler] of rules)
        content = replaceReference(
            content,
            regex,
            (...args) => handler(...args, file),
            file
        );

    return content;
}


function extractCodeBlocks(content) {
    const blocks = [];

    content = content.replace(
        /```[\s\S]*?```/g,
        block => {
            const token = `___CODE_${blocks.length}_${Date.now()}___`;
            blocks.push(block);
            return token;
        }
    );

    return { content, blocks };
}


function restoreCodeBlocks(content, blocks) {
    blocks.forEach((block, i) =>
        content = content.replace(
            new RegExp(`___CODE_${i}_\\d+___`),
            block
        )
    );

    return content;
}


function processFile(file) {
    stats.totalFiles++;

    const original = fs.readFileSync(file, "utf8");
    const relative = path.relative(CONFIG.contentDir, file);

    const { content, blocks } = extractCodeBlocks(original);

    const updated = restoreCodeBlocks(
        migrateContent(content, relative),
        blocks
    );

    if (updated !== original) {
        stats.updatedFiles++;
        fs.writeFileSync(file, updated);
        console.log(`✔ Updated: ${relative}`);
    }
}


function scan(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {

        if (item.isDirectory() && CONFIG.ignoreDirs.has(item.name))
            continue;

        const file = path.join(dir, item.name);

        if (item.isDirectory())
            scan(file);
        else if (item.name.endsWith(".mdx"))
            processFile(file);
    }
}


function writeLog() {
    fs.writeFileSync(
        CONFIG.logFile,
        `MDX Migration Report\n\n${JSON.stringify(stats, null, 2)}\n\n${logs.join("\n\n")}`
    );
}


function main() {
    console.log("Starting MDX migration...\n");

    scan(CONFIG.contentDir);
    writeLog();

    console.log(
        "Completed:",
        stats,
        "\nLog:",
        CONFIG.logFile
    );
}

main();
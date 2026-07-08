import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ======================================================
// CONFIG
// ======================================================

const CONTENT_DIR =
    path.resolve(
        __dirname,
        "../"
    );


const INDEX_FILE =
    path.resolve(
        __dirname,
        "../generated/content-index.json"
    );


const LOG_FILE =
    path.resolve(
        __dirname,
        "./mdx-reference-migration.log"
    );


const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "generated"
]);


// ======================================================
// VALIDATE INDEX
// ======================================================

if (!fs.existsSync(INDEX_FILE)) {

    throw new Error(
        `Content index not found: ${INDEX_FILE}`
    );

}


// ======================================================
// LOAD CONTENT INDEX
// ======================================================

const index =
    JSON.parse(
        fs.readFileSync(
            INDEX_FILE,
            "utf8"
        )
    );



const entries =
    Object.values(index);



// ======================================================
// BUILD LOOKUPS
// ======================================================


// Full normalized path lookup

const pathLookup =
    new Map();


// Filename lookup
// Multiple files can have same name

const fileLookup =
    new Map();



for (const item of entries) {


    const normalizedPath =
        normalizePath(
            item.filePath
        );


    pathLookup.set(
        normalizedPath,
        item
    );


    const fileName =
        path.basename(
            normalizedPath
        );


    const existing =
        fileLookup.get(
            fileName
        ) ?? [];


    existing.push(item);


    fileLookup.set(
        fileName,
        existing
    );

}



// ======================================================
// STATS
// ======================================================

const logs = [];


let totalFiles = 0;

let updatedFiles = 0;

let updatedReferences = 0;

let missingReferences = 0;

let duplicateReferences = 0;



// ======================================================
// HELPERS
// ======================================================


function normalizePath(
    value = ""
) {


    return value
        .replace(
            /\\/g,
            "/"
        )
        .replace(
            /^\/content\//,
            ""
        )
        .replace(
            /^\.\//,
            ""
        )
        .replace(
            /^\/+/,
            ""
        )
        .replace(
            /^(\.\.\/)+/,
            ""
        )
        .trim();

}



function addLog(
    type,
    file,
    oldValue,
    newValue = ""
) {


    logs.push(
        `
============================================================

${type}

File:
${file}

Old:
${oldValue}

${newValue ?
            `New:
${newValue}`
            :
            ""}

============================================================
`
    );

}



// ======================================================
// FIND CONTENT ENTRY
// ======================================================
//
// Priority:
//
// 1. Exact path match
// 2. Filename match
// 3. Reject duplicate filename
//
// ======================================================


function findEntry(
    referencePath
) {


    const normalized =
        normalizePath(
            referencePath
        );



    // ------------------------------------------
    // Exact path match
    // ------------------------------------------

    const exact =
        pathLookup.get(
            normalized
        );


    if (exact) {

        return exact;

    }



    // ------------------------------------------
    // Filename fallback
    // ------------------------------------------

    const fileName =
        path.basename(
            normalized
        );


    const matches =
        fileLookup.get(
            fileName
        );



    if (!matches) {

        return null;

    }



    if (matches.length > 1) {

        duplicateReferences++;

        return null;

    }



    return matches[0];

}

function migrateContent(
    content,
    relativeFile
) {


    // ==================================================
    // PASS 1
    //
    // Markdown links
    //
    // [Title](file.mdx)
    //
    // ==================================================

    content =
        content.replace(
            /\[([^\]]*)\]\(([^)\s]+\.mdx)\)/g,
            (
                fullMatch,
                oldTitle,
                mdxPath
            ) => {


                const entry =
                    findEntry(
                        mdxPath
                    );


                if (!entry) {

                    missingReferences++;


                    addLog(
                        "NOT FOUND",
                        relativeFile,
                        fullMatch
                    );


                    return fullMatch;

                }



                const replacement =
                    `[${oldTitle || entry.title}](${entry.id})`;



                updatedReferences++;


                addLog(
                    "UPDATED",
                    relativeFile,
                    fullMatch,
                    replacement
                );


                return replacement;

            }
        );




    // ==================================================
    // PASS 2
    //
    // Bullet references
    //
    // - handbook/file.mdx
    //
    // ==================================================

    content =
        content.replace(
            /^\s*-\s*`?([^`\n]+\.mdx)`?\s*$/gm,
            (
                fullMatch,
                mdxPath
            ) => {


                const entry =
                    findEntry(
                        mdxPath
                    );



                if (!entry) {

                    missingReferences++;


                    addLog(
                        "NOT FOUND",
                        relativeFile,
                        fullMatch
                    );


                    return fullMatch;

                }



                const replacement =
                    `- [${entry.title}](${entry.id})`;



                updatedReferences++;


                addLog(
                    "UPDATED",
                    relativeFile,
                    fullMatch,
                    replacement
                );


                return replacement;

            }
        );





    // ==================================================
    // PASS 3
    //
    // Inline MDX path
    //
    // `handbook/file.mdx`
    //
    // ==================================================

    content =
        content.replace(
            /`([^`\n]+\.mdx)`/g,
            (
                fullMatch,
                mdxPath
            ) => {


                const entry =
                    findEntry(
                        mdxPath
                    );



                if (!entry) {


                    missingReferences++;


                    addLog(
                        "NOT FOUND",
                        relativeFile,
                        fullMatch
                    );


                    return fullMatch;

                }



                const replacement =
                    `[${entry.title}](${entry.id})`;



                updatedReferences++;


                addLog(
                    "UPDATED",
                    relativeFile,
                    fullMatch,
                    replacement
                );


                return replacement;

            }
        );





    // ==================================================
    // PASS 4
    //
    // Plain MDX paths
    //
    // handbook/a/b/file.mdx
    //
    // ==================================================

    content =
        content.replace(
            /(^|[\s:>])([A-Za-z0-9_./-]+\.mdx)(?=$|[\s<])/gm,
            (
                fullMatch,
                prefix,
                mdxPath
            ) => {


                const entry =
                    findEntry(
                        mdxPath
                    );



                if (!entry) {


                    missingReferences++;


                    addLog(
                        "NOT FOUND",
                        relativeFile,
                        mdxPath
                    );


                    return fullMatch;

                }



                const replacement =
                    `${prefix}[${entry.title}](${entry.id})`;



                updatedReferences++;


                addLog(
                    "UPDATED",
                    relativeFile,
                    mdxPath,
                    replacement.trim()
                );


                return replacement;

            }
        );



    return content;

}





// ======================================================
// PROTECT CODE BLOCKS
// ======================================================


function extractCodeBlocks(
    content
) {


    const blocks = [];



    const replaced =
        content.replace(
            /```[\s\S]*?```/g,
            (
                block
            ) => {


                const token =
                    `___MDX_CODE_BLOCK_${Date.now()}_${blocks.length}___`;



                blocks.push(
                    block
                );


                return token;

            }
        );



    return {
        content: replaced,
        blocks
    };

}





function restoreCodeBlocks(
    content,
    blocks
) {


    blocks.forEach(
        (
            block,
            index
        ) => {


            const token =
                new RegExp(
                    `___MDX_CODE_BLOCK_\\d+_${index}___`
                );



            content =
                content.replace(
                    token,
                    block
                );

        }
    );



    return content;

}



// ======================================================
// PROCESS SINGLE MDX FILE
// ======================================================


function processFile(
    fullPath
) {


    totalFiles++;


    const relativeFile =
        path.relative(
            CONTENT_DIR,
            fullPath
        );



    const originalContent =
        fs.readFileSync(
            fullPath,
            "utf8"
        );



    const {
        content: withoutCodeBlocks,
        blocks
    } =
        extractCodeBlocks(
            originalContent
        );



    let migratedContent =
        migrateContent(
            withoutCodeBlocks,
            relativeFile
        );



    migratedContent =
        restoreCodeBlocks(
            migratedContent,
            blocks
        );



    if (
        migratedContent !== originalContent
    ) {


        updatedFiles++;



        fs.writeFileSync(
            fullPath,
            migratedContent,
            "utf8"
        );



        console.log(
            `✔ Updated : ${relativeFile}`
        );

    }

}





// ======================================================
// DIRECTORY SCANNER
// ======================================================


function scan(
    directory
) {


    const items =
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        );



    for (
        const item of items
    ) {


        // --------------------------------------
        // Ignore folders
        // --------------------------------------

        if (
            item.isDirectory()
            &&
            IGNORE_DIRS.has(
                item.name
            )
        ) {

            continue;

        }



        const fullPath =
            path.join(
                directory,
                item.name
            );



        if (
            item.isDirectory()
        ) {


            scan(
                fullPath
            );


            continue;

        }



        if (
            !item.name.endsWith(
                ".mdx"
            )
        ) {

            continue;

        }



        processFile(
            fullPath
        );

    }

}





// ======================================================
// WRITE LOG
// ======================================================


function writeLog() {


    const summary =
        `
MDX Reference Migration Report
================================

Total Files Scanned :
${totalFiles}

Files Updated :
${updatedFiles}

References Updated :
${updatedReferences}

Missing References :
${missingReferences}

Duplicate References :
${duplicateReferences}


`;


    fs.writeFileSync(
        LOG_FILE,
        summary + logs.join("\n"),
        "utf8"
    );

}





// ======================================================
// EXECUTION
// ======================================================


function main() {


    console.log(
        "\nStarting MDX reference migration...\n"
    );



    console.log(
        `Content Directory:
${CONTENT_DIR}\n`
    );



    scan(
        CONTENT_DIR
    );



    writeLog();



    console.log(
        `
================================

Migration Completed

Files Scanned :
${totalFiles}

Files Updated :
${updatedFiles}

References Updated :
${updatedReferences}

Missing :
${missingReferences}

Duplicates :
${duplicateReferences}


Log File :
${LOG_FILE}

================================
`
    );

}



main();
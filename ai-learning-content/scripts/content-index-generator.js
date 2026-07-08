import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality for ES6 Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define absolute root and file location tracks
const PROJECT_ROOT = path.resolve(__dirname, '../');
const CONTENT_DIR = PROJECT_ROOT;
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'generated', 'content-index.json');

export default async function loadFrontMattersFromContent() {
    const frontMattersObj = {};

    try {
        // Native Recursive Directory Scan
        // recursive: true reads all subfolders natively without requiring the 'glob' library
        const files = await fs.readdir(CONTENT_DIR, { recursive: true });

        // Filter out everything except .mdx files
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));

        for (const relativePath of mdxFiles) {
            // Build the absolute path to read the file
            const absolutePath = path.join(CONTENT_DIR, relativePath);

            try {
                const content = await fs.readFile(absolutePath, 'utf-8');

                // Format relative path for frontend output structure (e.g., /content/lesson.mdx)
                const relativeFilePath = '/' + path.relative(PROJECT_ROOT, absolutePath).replace(/\\/g, '/');

                const frontMatter = parseFrontMatter(relativeFilePath, content);
                if (frontMatter) {
                    frontMattersObj[frontMatter.id] = frontMatter;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load file ${absolutePath}:`, error);
            }
        }


        const dataLength = Object.values(frontMattersObj).length;
        if (!dataLength) {
            console.warn('⚠️ No frontMatters metadata found');
        }

        // 1. Convert to an array, sort by 'day', and convert back to an object
        const sortedData = Object.fromEntries(
            Object.entries(frontMattersObj).sort((a, b) => a[1].day - b[1].day)
        );


        // Sort items sequentially by day sequence
        //frontMatters.sort((a, b) => a.day - b.day);

        // Ensure public target destination folder exists securely
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

        // Save JSON config output matrix back down to disk 
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(sortedData, null, 2), 'utf-8');
        console.log(`🎉 FrontMatters written to: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('❌ Error loading frontMatters:', error);
    }

    return frontMattersObj;
}

export function parseFrontMatter(filePath, content) {
    // Native Regex to extract front matter sitting between --- markers
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!frontMatterMatch) {
        console.warn(`⚠️ No front matter block boundaries found in ${filePath}`);
        return null;
    }

    const frontMatterRawText = frontMatterMatch[1];

    // Native custom fallback text parsing block to simulate YAML properties dictionary
    const parseField = (regex) => {
        const match = frontMatterRawText.match(regex);
        return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
    };

    // Native line extraction block for structural markdown list blocks (dash arrays)
    const parseArrayField = (fieldName) => {
        const blockRegex = new RegExp(`${fieldName}:\\s*\\r?\\n([\\s\\S]*?)(?=\\n\\w+:|$)`);
        const blockMatch = frontMatterRawText.match(blockRegex);
        if (!blockMatch) return [];

        return blockMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').replace(/^["']|["']$/g, '').trim());
    };

    // Map base primitives properties matching standard data structure formats
    const dayStr = parseField(/day:\s*(\d+)/) || 999;
    const day = parseInt(dayStr, 10);
    const title = parseField(/title:\s*(.+)/);

    if (!title) {
        console.warn(`⚠️ Missing required 'title' validation criteria in ${filePath}`);
        return null;
    }

    // Capture multiline YAML block indicators (description block text scalars)
    let description = '';
    const descMatch = frontMatterRawText.match(/description:\s*>\r?\n([\s\S]*?)(?=\n\w+:|$)/);
    if (descMatch) {
        description = descMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ');
    } else {
        description = parseField(/description:\s*(.+)/);
    }

    // Process key value pairs manually to handle resource mappings dynamically
    const resources = [];
    const resourceLines = parseArrayField('resources');
    // Expecting raw format to alternate between title text line and URL path sequence line
    for (let i = 0; i < resourceLines.length; i += 2) {
        if (resourceLines[i] && resourceLines[i + 1]) {
            resources.push({
                title: resourceLines[i],
                url: resourceLines[i + 1],
                type: 'docs'
            });
        }
    }

    return {
        id: formatPathWithFilename(filePath),
        day: day,
        title: title,
        description: description,
        difficulty: parseField(/difficulty:\s*(.+)/) || 'Beginner',
        estimatedTime: parseField(/estimatedTime:\s*(.+)/) || '1 Hour',
        status: parseField(/status:\s*(.+)/) || 'not-started',
        topics: parseArrayField('topics'),
        prerequisites: parseArrayField('prerequisites'),
        resources: resources,
        project: parseField(/project:\s*(.+)/) || null,
        interviewLevel: parseField(/interviewLevel:\s*(.+)/) || null,
        tags: parseArrayField('tags'),
        summary: parseField(/summary:\s*(.+)/) || '',
        filePath: filePath
    };
}

function formatPathWithFilename(filePath) {
    // 1. Split path by slashes into an array
    const parts = filePath.split('/');

    // 2. Remove the last element (the filename: "lesson.mdx")
    const fullFileName = parts.pop();

    // 3. Extract just the name without the extension ("lesson")
    const fileNameWithoutExt = path.parse(fullFileName).name;

    // 4. Filter out any empty items (like leading slashes)
    const activeSegments = parts.filter(part => part.length > 0);

    // 5. Push the cleaned filename into the directory array
    activeSegments.push(fileNameWithoutExt);

    // 6. Join all segments together with dots
    return activeSegments.join('.');
}

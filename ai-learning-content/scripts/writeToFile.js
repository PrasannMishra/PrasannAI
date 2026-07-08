import { promises as fs } from 'fs';
import path from 'path';

/**
 * Atomically writes JSON to disk.
 * The target file is never left partially written.
 */
export default async function writeToFile(
    filePath,
    data,
    spaces = 2
) {
    if (!filePath.trim()) {
        throw new Error('File path cannot be empty.');
    }

    const directory = path.dirname(filePath);
    const tempFile = `${filePath}.tmp`;

    try {
        await fs.mkdir(directory, { recursive: true });

        const json = JSON.stringify(data, null, spaces);

        await fs.writeFile(tempFile, `${json}\n`, 'utf8');

        await fs.rename(tempFile, filePath);
    } catch (error) {
        // Cleanup temp file if it exists
        try {
            await fs.unlink(tempFile);
        } catch {
            // Ignore cleanup failures
        }

        throw new Error(
            `Unable to write '${filePath}': ${error instanceof Error ? error.message : String(error)
            }`
        );
    }
}
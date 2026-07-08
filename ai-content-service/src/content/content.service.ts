import {
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ContentIndexEntry } from './content-index-entry.interface';

@Injectable()
export class ContentService implements OnModuleInit {
    private readonly logger = new Logger(ContentService.name);

    private readonly contentRoot: string;
    private readonly generatedRoot: string;

    /**
     * Cached content index.
     * Loaded once when the application starts.
     */
    private contentIndex: Record<string, ContentIndexEntry> = {};

    constructor(private readonly configService: ConfigService) {
        this.contentRoot = this.getRequiredConfig('CONTENT_ROOT');
        this.generatedRoot = this.getRequiredConfig('CONTENT_GENERATED');
    }

    async onModuleInit(): Promise<void> {
        await this.loadContentIndex();
    }

    // --------------------------------------------------------------------------
    // Public API
    // --------------------------------------------------------------------------

    /**
     * Returns all lesson metadata.
     */
    async getContentIndex() {
        return this.contentIndex;
    }

    /**
     * Returns navigation tree.
     */
    async getNavigation() {
        return this.readGeneratedJson('navigation.json');
    }

    /**
     * Returns search index.
     */
    async getSearchIndex() {
        return this.readGeneratedJson('search-index.json');
    }

    /**
     * Returns markdown/mdx content by content id.
     */
    async getContent(contentId: string): Promise<string> {
        const lesson = this.contentIndex[contentId];

        if (!lesson) {
            throw new NotFoundException(
                `Content '${contentId}' not found.`,
            );
        }

        const fullContent = await this.readText(
            this.contentRoot,
            lesson.filePath,
        );

        // Native Regex to extract front matter sitting between --- markers
        const frontMatterMatch = fullContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        return frontMatterMatch ? fullContent.slice(frontMatterMatch[0].length).trim() : '';
    }

    // --------------------------------------------------------------------------
    // Initialization
    // --------------------------------------------------------------------------

    /**
     * Loads the generated content index into memory.
     * Called once during application startup.
     */
    private async loadContentIndex(): Promise<void> {
        this.contentIndex =
            await this.readGeneratedJson<Record<string, ContentIndexEntry>>(
                'content-index.json',
            );

        this.logger.log(
            `Loaded ${Object.keys(this.contentIndex).length} content entries.`,
        );
    }

    // --------------------------------------------------------------------------
    // Generated Files
    // --------------------------------------------------------------------------

    private async readGeneratedJson<T>(
        fileName: string,
    ): Promise<T> {
        return this.readJson<T>(
            this.generatedRoot,
            fileName,
        );
    }

    // --------------------------------------------------------------------------
    // Generic Readers
    // --------------------------------------------------------------------------

    private async readJson<T>(
        baseDir: string,
        relativePath: string,
    ): Promise<T> {
        const content = await this.readFile(
            baseDir,
            relativePath,
        );

        try {
            return JSON.parse(content) as T;
        } catch {
            throw new Error(
                `Invalid JSON file: ${relativePath}`,
            );
        }
    }

    private async readText(
        baseDir: string,
        relativePath: string,
    ): Promise<string> {
        return this.readFile(baseDir, relativePath);
    }

    private async readFile(
        baseDir: string,
        relativePath: string,
    ): Promise<string> {
        const file = this.resolveSafePath(
            baseDir,
            relativePath,
        );

        try {
            return await fs.readFile(file, 'utf8');
        } catch {
            throw new NotFoundException(
                `File '${relativePath}' not found.`,
            );
        }
    }

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    /**
     * Prevents path traversal attacks.
     */
    private resolveSafePath(
        baseDir: string,
        relativePath: string,
    ): string {

        // 1. Strip any leading slashes so Node treats it as relative
        const cleanRelativePath = relativePath.replace(/^[/\\]+/, '');

        const resolvedPath = path.resolve(
            baseDir,
            cleanRelativePath,
        );

        const root = path.resolve(baseDir);

        if (!resolvedPath.startsWith(root)) {
            throw new Error(
                `Invalid file path: ${relativePath}`,
            );
        }

        return resolvedPath;
    }

    /**
     * Reads required environment variables.
     */
    private getRequiredConfig(key: string): string {
        const value =
            this.configService.get<string>(key);

        if (!value) {
            throw new Error(
                `${key} is missing in the .env file.`,
            );
        }

        return value;
    }
}
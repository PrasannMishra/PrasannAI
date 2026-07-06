import { Lesson, LessonMetadata } from '@/types';
import { validateLessonMetadata } from './contentSchema';

export interface ContentManifest {
    version: string;
    generatedAt: string;
    lessons: LessonMetadata[];
    categories: string[];
    tags: string[];
    totalLessons: number;
}

export async function generateContentManifest(): Promise<ContentManifest> {
    const lessons: Lesson[] = [];
    const metadataList: LessonMetadata[] = [];
    const categories = new Set<string>();
    const tags = new Set<string>();

    try {
        // Dynamic import of all lesson files
        const lessonFiles = import.meta.glob('/src/content/**/lesson.mdx', { as: 'raw' });

        for (const filePath in lessonFiles) {
            try {
                const content = await lessonFiles[filePath]() as string;
                const lesson = parseLessonFromMDX(filePath, content);

                if (lesson) {
                    lessons.push(lesson);

                    // Validate and extract metadata
                    const metadata = extractMetadata(lesson);
                    const validatedMetadata = validateLessonMetadata(metadata);
                    metadataList.push(validatedMetadata);

                    // Collect categories and tags
                    validatedMetadata.category.forEach(cat => categories.add(cat));
                    validatedMetadata.tags.forEach(tag => tags.add(tag));
                }
            } catch (error) {
                console.warn(`Failed to process ${filePath}:`, error);
            }
        }

        // Sort by day
        lessons.sort((a, b) => a.day - b.day);

        return {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            lessons: metadataList,
            categories: Array.from(categories),
            tags: Array.from(tags),
            totalLessons: lessons.length,
        };
    } catch (error) {
        console.error('Error generating content manifest:', error);
        throw error;
    }
}

function parseLessonFromMDX(filePath: string, content: string): Lesson | null {
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!frontMatterMatch) {
        console.warn(`No front matter found in ${filePath}`);
        return null;
    }

    const frontMatter = frontMatterMatch[1];
    const lessonContent = content.slice(frontMatterMatch[0].length).trim();

    const parseArray = (str: string): string[] => {
        return str
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    };

    const dayMatch = frontMatter.match(/day:\s*(\d+)/);
    const titleMatch = frontMatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const difficultyMatch = frontMatter.match(/difficulty:\s*["']?([^"'\n]+)["']?/);
    const estimatedTimeMatch = frontMatter.match(/estimatedTime:\s*["']?([^"'\n]+)["']?/);
    const statusMatch = frontMatter.match(/status:\s*["']?([^"'\n]+)["']?/);
    const projectMatch = frontMatter.match(/project:\s*["']?([^"'\n]+)["']?/);
    const interviewLevelMatch = frontMatter.match(/interviewLevel:\s*["']?([^"'\n]+)["']?/);
    const summaryMatch = frontMatter.match(/summary:\s*["']?([^"'\n]+)["']?/);
    const descriptionMatch = frontMatter.match(/description:\s*["']?([^"'\n]+)["']?/);

    const topicsMatch = frontMatter.match(/topics:\n([\s\S]*?)(?=\n\w+:|$)/);
    const prerequisitesMatch = frontMatter.match(/prerequisites:\n([\s\S]*?)(?=\n\w+:|$)/);
    const resourcesMatch = frontMatter.match(/resources:\n([\s\S]*?)(?=\n\w+:|$)/);
    const tagsMatch = frontMatter.match(/tags:\n([\s\S]*?)(?=\n\w+:|$)/);

    if (!dayMatch || !titleMatch) {
        console.warn(`Missing required fields in ${filePath}`);
        return null;
    }

    const day = parseInt(dayMatch[1]);
    const title = titleMatch[1].trim();
    const difficulty = (difficultyMatch?.[1]?.trim() || 'Beginner') as Lesson['difficulty'];
    const estimatedTime = estimatedTimeMatch?.[1]?.trim() || '1 Hour';
    const status = (statusMatch?.[1]?.trim() || 'not-started') as Lesson['status'];
    const project = projectMatch?.[1]?.trim();
    const interviewLevel = interviewLevelMatch?.[1]?.trim();
    const summary = summaryMatch?.[1]?.trim() || '';
    const description = descriptionMatch?.[1]?.trim() || '';

    const topics = topicsMatch ? parseArray(topicsMatch[1]) : [];
    const prerequisites = prerequisitesMatch ? parseArray(prerequisitesMatch[1]) : [];
    const tags = tagsMatch ? parseArray(tagsMatch[1]) : [];

    const resources: Lesson['resources'] = [];
    if (resourcesMatch) {
        const resourceLines = resourcesMatch[1].split('\n').filter(line => line.trim());
        for (let i = 0; i < resourceLines.length; i += 2) {
            if (i + 1 < resourceLines.length) {
                resources.push({
                    title: resourceLines[i].trim(),
                    url: resourceLines[i + 1].trim(),
                    type: 'docs',
                });
            }
        }
    }

    const id = `day-${String(day).padStart(3, '0')}`;

    return {
        id,
        day,
        title,
        description,
        difficulty,
        estimatedTime,
        status,
        topics,
        prerequisites,
        resources,
        project,
        interviewLevel,
        tags,
        summary,
        content: lessonContent,
        filePath,
    };
}

function extractMetadata(lesson: Lesson): LessonMetadata {
    return {
        id: lesson.id,
        type: 'roadmap',
        day: lesson.day,
        title: lesson.title,
        subtitle: '',
        description: lesson.description,
        difficulty: lesson.difficulty,
        estimatedTime: lesson.estimatedTime,
        readingTime: '45 min',
        status: lesson.status,
        version: '1.0.0',
        author: 'AI Learning Hub',
        category: [],
        topics: lesson.topics,
        tags: lesson.tags,
        prerequisites: lesson.prerequisites,
        learningObjectives: [],
        projects: lesson.project ? [lesson.project] : [],
        assignment: false,
        quiz: false,
        searchable: true,
        pdf: false,
        related: [],
        lastUpdated: new Date().toISOString().split('T')[0],
    };
}

export function getLessonById(lessons: Lesson[], id: string): Lesson | undefined {
    return lessons.find(lesson => lesson.id === id);
}

export function getAdjacentLessons(lessons: Lesson[], currentId: string): { previous?: Lesson; next?: Lesson } {
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentId);

    return {
        previous: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
        next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined,
    };
}

export function filterLessonsByCategory(lessons: Lesson[], category: string): Lesson[] {
    const categoryMap: Record<string, string[]> = {
        'Introduction': ['introduction', 'getting-started', 'setup'],
        'Core AI': ['ai', 'artificial-intelligence', 'machine-learning'],
        'LLMs': ['llm', 'language-model', 'gpt', 'claude'],
        'Prompt Engineering': ['prompt', 'prompt-engineering'],
        'Context Engineering': ['context', 'context-engineering'],
        'RAG': ['rag', 'retrieval', 'vector'],
        'Embeddings': ['embedding', 'vector-embedding'],
        'Agents': ['agent', 'autonomous'],
        'MCP': ['mcp', 'model-context-protocol'],
        'Projects': [],
        'Interview Preparation': ['interview'],
        'Architecture': ['architecture', 'design'],
        'Cheat Sheets': ['cheat-sheet', 'reference'],
        'Resources': [],
    };

    const keywords = categoryMap[category] || [];
    if (keywords.length === 0) return [];

    return lessons.filter(lesson => {
        const searchText = `${lesson.title} ${lesson.description} ${lesson.topics.join(' ')} ${lesson.tags.join(' ')}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
    });
}
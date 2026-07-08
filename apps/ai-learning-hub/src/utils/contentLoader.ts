import { FrontMatter, Lesson } from '@/types';

// Use import.meta.glob to dynamically discover all lesson files
export const lessonFiles = import.meta.glob('/content/**/*.mdx', { as: 'raw' });

export default async function loadFrontMattersFromContent(): Promise<FrontMatter[]> {
    const frontMatters: FrontMatter[] = [];

    try {

        for (const filePath in lessonFiles) {
            try {
                const content = await lessonFiles[filePath]() as string;
                const frontMatter = parseLessonFromMDX(filePath, content, null);
                if (frontMatter) {
                    frontMatters.push(frontMatter);
                }
            } catch (error) {
                console.warn(`Failed to load ${filePath}:`, error);
            }
        }

        if (frontMatters.length === 0) {
            console.warn('No frontMatters found');
        }

        frontMatters.sort((a, b) => a.day - b.day);
    } catch (error) {
        console.error('Error loading frontMatters:', error);
    }
    //write this frontmatters array into a content-index.json file in the public folder of the project. 
    // The content-index.json file should be structured as an array of objects, 
    // where each object represents a lesson's front matter. Each object should include the following properties:
    //  id, day, title, description, difficulty, estimatedTime, status, topics, prerequisites, resources,
    //  assignment (if available), project (if available), interviewLevel (if available), tags, summary, 
    // and filePath. 

    // await writeToFile('/content/build/content-index.json', frontMatters, 2)
    //     .then(() => {
    //         console.log('FrontMatters written to public/content-index.json');
    //     });

    return frontMatters;
}

export function parseLessonFromMDX(filePath: string, content: string, linkedDay): FrontMatter | null {
    // Match front matter between --- markers
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!frontMatterMatch) {
        console.warn(`No front matter found in ${filePath}`);
        return null;
    }

    const frontMatter = frontMatterMatch[1];
    // Get everything after the closing ---
    // const lessonContent = content.slice(frontMatterMatch[0].length).trim();

    const parseArray = (str: string): string[] => {
        return str
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    };

    const dayMatch = frontMatter.match(/day:\s*(\d+)/) || linkedDay || 9999;
    const titleMatch = frontMatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const difficultyMatch = frontMatter.match(/difficulty:\s*["']?([^"'\n]+)["']?/);
    const estimatedTimeMatch = frontMatter.match(/estimatedTime:\s*["']?([^"'\n]+)["']?/);
    const statusMatch = frontMatter.match(/status:\s*["']?([^"'\n]+)["']?/);
    const projectMatch = frontMatter.match(/project:\s*["']?([^"'\n]+)["']?/);
    const interviewLevelMatch = frontMatter.match(/interviewLevel:\s*["']?([^"'\n]+)["']?/);
    const summaryMatch = frontMatter.match(/summary:\s*["']?([^"'\n]+)["']?/);
    const descriptionMatch = frontMatter.match(/description:\s*>\r?\n([\s\S]*?)(?=\n\w+:|$)/);

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
    let description = descriptionMatch?.[1]?.trim() || '';

    // Clean up folded block scalar: remove indentation and join lines with spaces
    if (description) {
        description = description
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ');
    }

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
        // content: lessonContent,
        filePath,
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
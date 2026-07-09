export interface Lesson {
    id: string;
    day: number;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    status: 'not-started' | 'in-progress' | 'completed';
    topics: string[];
    prerequisites: string[];
    resources: Resource[];
    assignment?: Assignment;
    project?: string;
    interviewLevel?: string;
    tags: string[];
    summary: string;
    content: string;
    filePath: string;
    phase?: string;
    categories: string[];
}

export interface FrontMatter {
    id: string;
    day: number;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    status: 'not-started' | 'in-progress' | 'completed';
    topics: string[];
    prerequisites: string[];
    resources: Resource[];
    assignment?: Assignment;
    project?: string;
    interviewLevel?: string;
    tags: string[];
    summary: string;
    filePath: string;
    phase?: string;
    categories: string[];
}

export interface Resource {
    title: string;
    url: string;
    type: 'video' | 'blog' | 'docs' | 'book' | 'course';
}

export interface Assignment {
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    status: 'not-started' | 'in-progress' | 'completed';
    solutionLink?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    overview: string;
    architecture: string;
    lessonsUsed: string[];
    techStack: string[];
    githubLink?: string;
    status: 'not-started' | 'in-progress' | 'completed';
    progress: number;
}

export interface Bookmark {
    id: string;
    lessonId: string;
    type: 'lesson' | 'heading' | 'code' | 'project' | 'assignment';
    title: string;
    createdAt: Date;
}

export interface Note {
    id: string;
    lessonId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProgress {
    completedLessons: string[];
    readingProgress: Record<string, number>;
    bookmarks: Bookmark[];
    notes: Note[];
    lastOpenedLesson?: string;
    quizScores: Record<string, number>;
    assignmentsCompleted: string[];
}

export interface SearchResult {
    lesson: Lesson;
    matches: {
        field: 'title' | 'content' | 'topics' | 'tags';
        snippet: string;
    }[];
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    lessons: Lesson[];
}

export type Theme = 'light' | 'dark' | 'system';

export type LessonType = 'roadmap' | 'handbook' | 'glossary' | 'cheatsheet' | 'project' | 'resource';

export interface LessonMetadata {
    id: string;
    type: LessonType;
    day: number;
    title: string;
    subtitle?: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    readingTime?: string;
    status: 'not-started' | 'in-progress' | 'completed';
    version?: string;
    author?: string;
    category: string[];
    topics: string[];
    tags: string[];
    prerequisites: string[];
    learningObjectives: string[];
    projects: string[];
    assignment: boolean;
    quiz: boolean;
    searchable: boolean;
    pdf: boolean;
    related: string[];
    lastUpdated: string;
    phase?: string;
}

export interface AppSettings {
    theme: Theme;
    fontSize: 'small' | 'medium' | 'large';
    readingWidth: 'narrow' | 'medium' | 'wide';
    animations: boolean;
}

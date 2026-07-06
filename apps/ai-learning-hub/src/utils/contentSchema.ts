import { z } from 'zod';

export const LessonSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    type: z.enum(['roadmap', 'handbook', 'glossary', 'cheatsheet', 'project', 'resource']),
    day: z.number().int().positive('Day must be a positive integer'),
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    estimatedTime: z.string(),
    readingTime: z.string().optional(),
    status: z.enum(['not-started', 'in-progress', 'completed']).default('not-started'),
    version: z.string().default('1.0.0'),
    author: z.string().default('AI Learning Hub'),
    category: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
    learningObjectives: z.array(z.string()).default([]),
    projects: z.array(z.string()).default([]),
    assignment: z.boolean().default(false),
    quiz: z.boolean().default(false),
    searchable: z.boolean().default(true),
    pdf: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    lastUpdated: z.string().default(new Date().toISOString().split('T')[0]),
});

export type LessonMetadata = z.infer<typeof LessonSchema>;

export function validateLessonMetadata(metadata: unknown): LessonMetadata {
    try {
        return LessonSchema.parse(metadata);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Invalid lesson metadata: ${errors}`);
        }
        throw error;
    }
}
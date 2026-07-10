import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useLessonStore } from '@/stores/useLessonStore';
import { SearchResult } from '@/types';
import { Link } from 'react-router-dom';

export default function SearchPage() {
    const lessons = useLessonStore(state => state.lessons);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase();

        lessons.forEach(lesson => {
            const matches: SearchResult['matches'] = [];

            if (lesson.title.toLowerCase().includes(lowerQuery)) {
                matches.push({
                    field: 'title',
                    snippet: lesson.title,
                });
            }

            if (lesson.description.toLowerCase().includes(lowerQuery)) {
                matches.push({
                    field: 'content',
                    snippet: lesson.description,
                });
            }

            const contentMatch = lesson?.content?.toLowerCase().includes(lowerQuery) ?? "";
            if (contentMatch) {
                const index = lesson.content.toLowerCase().indexOf(lowerQuery);
                const start = Math.max(0, index - 50);
                const end = Math.min(lesson.content.length, index + query.length + 50);
                const snippet = start > 0 ? '...' + lesson.content.slice(start, end) + '...' : lesson.content.slice(start, end);

                matches.push({
                    field: 'content',
                    snippet,
                });
            }

            lesson.topics.forEach(topic => {
                if (topic.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        field: 'topics',
                        snippet: topic,
                    });
                }
            });

            lesson.tags.forEach(tag => {
                if (tag.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        field: 'tags',
                        snippet: tag,
                    });
                }
            });

            if (matches.length > 0) {
                searchResults.push({ lesson, matches });
            }
        });

        setResults(searchResults);
    }, [query, lessons]);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>

            <div className="relative mb-6">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search lessons, topics, tags..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    autoFocus
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {results.length === 0 && query && (
                    <div className="text-center py-12">
                        <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h2>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search query</p>
                    </div>
                )}

                {results.map(result => (
                    <Link
                        key={result.lesson.id}
                        to={`/lesson/${result.lesson.id}`}
                        className="block card hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                        Day {result.lesson.day}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${result.lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                        result.lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {result.lesson.difficulty}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {result.lesson.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {result.lesson.description}
                                </p>
                                <div className="space-y-1">
                                    {result.matches.slice(0, 3).map((match, idx) => (
                                        <p key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">in {match.field}:</span> {match.snippet}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
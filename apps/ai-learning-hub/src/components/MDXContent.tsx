import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MDXContentProps {
    content: string;
}

export default function MDXContent({ content }: MDXContentProps) {
    const processedContent = useMemo(() => {
        // Fix mermaid diagrams by ensuring arrows are on separate lines
        return content.replace(/```mermaid\n([\s\S]*?)```/g, (match, mermaidContent) => {
            // Split into lines and process
            const lines = mermaidContent.split('\n');
            const cleaned = lines.map((line: string) => line.trim()).filter((line: string) => line.length > 0);
            return `\`\`\`mermaid\n${cleaned.join('\n')}\`\`\``;
        });
    }, [content]);

    if (!content || content.trim().length === 0) {
        return (
            <div className="prose-content">
                <p className="text-gray-500">No content available</p>
            </div>
        );
    }

    return (
        <div className="prose-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom components for better rendering
                    h1: ({ children }) => {
                        const text = typeof children === 'string' ? children : '';
                        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                        return <h1 id={id} className="text-4xl font-bold mb-4 mt-6">{children}</h1>;
                    },
                    h2: ({ children }) => {
                        const text = typeof children === 'string' ? children : '';
                        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                        return <h2 id={id} className="text-3xl font-bold mb-3 mt-5">{children}</h2>;
                    },
                    h3: ({ children }) => {
                        const text = typeof children === 'string' ? children : '';
                        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                        return <h3 id={id} className="text-2xl font-bold mb-2 mt-4">{children}</h3>;
                    },
                    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        // For mermaid blocks, render as pre-formatted text
                        if (language === 'mermaid') {
                            return (
                                <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-mono">
                                        Mermaid Diagram
                                    </div>
                                    <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                                        {String(children).replace(/\n$/, '')}
                                    </pre>
                                </div>
                            );
                        }

                        // For other code blocks, use default rendering
                        const isInline = !className?.includes('language-');
                        if (isInline) {
                            return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>;
                        }
                        return <code className={className} {...props}>{children}</code>;
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}
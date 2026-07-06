export interface Heading {
    id: string;
    text: string;
    level: number;
}

export function extractHeadings(content: string): Heading[] {
    const headings: Heading[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            headings.push({ id, text, level });
        }
    }

    return headings;
}

export function scrollToHeading(headingId: string) {
    const element = document.getElementById(headingId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
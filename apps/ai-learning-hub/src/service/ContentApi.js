const BASE_URL = 'http://localhost:3000/api';
const GIT_RAW_BASE_URL = 'https://raw.githubusercontent.com/PrasannMishra/PrasannAI/refs/heads/main/ai-learning-content';

let lessonsMappedByID = null;
const findLessonPath = (contentID) => lessonsMappedByID?.[contentID]?.["filePath"] || "";

/**
 * Helper to handle standard fetch responses safely
 */
async function handleResponse(response, expectJson = true) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }
    return expectJson ? response.json() : response.text();
}

const ContentApi = {
    /**
     * Fetches the overall content index JSON configuration
     */
    getContentIndex: async () => {
        const res = await fetch(`${BASE_URL}/content-index`);
        const result = await handleResponse(res, true);
        return Object.values(result);
    },

    /**
     * Fetches the navigation structural JSON data
     */
    getNavigation: async () => {
        const res = await fetch(`${BASE_URL}/navigation`);
        return handleResponse(res, true);
    },

    /**
     * Fetches the search index database config mapping
     */
    getSearchIndex: async () => {
        const res = await fetch(`${BASE_URL}/search-index`);
        return handleResponse(res, true);
    },

    /**
     * Fetches raw content directly using either Path Params or Query Params styles.
     * Defaults to Path Parameter layout style.
     */
    getContentById: async (contentId, useQueryParamStyle = false) => {
        try {
            const targetUrl = useQueryParamStyle
                ? `${BASE_URL}/content?id=${contentId}`
                : `${BASE_URL}/content/${contentId}`;

            const res = await fetch(targetUrl);
            // Crucial: Pass 'false' because your backend explicitly returns text/plain 
            return handleResponse(res, false);
        } catch (error) {
            return null;
        }
    },

    getContentIndexByPathFromGit: async (contentPath) => {
        const res = await fetch(`${GIT_RAW_BASE_URL}/${encodeURIComponent(contentPath)}`);
        const jsonResponse = await handleResponse(res, true);
        lessonsMappedByID = jsonResponse; // Cache the mapping for future lookups
        return Object.values(jsonResponse);
    },

    getContentByIdFromGit: async (contentId) => {
        if (!lessonsMappedByID) {
            await getContentIndexByPathFromGit('generated/content-index.json');
        }
        const res = await fetch(`${GIT_RAW_BASE_URL}/${encodeURIComponent(findLessonPath(contentId))}`);
        const fullContent = await handleResponse(res, false);
        // Native Regex to extract front matter sitting between --- markers
        const frontMatterMatch = fullContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        return frontMatterMatch ? fullContent.slice(frontMatterMatch[0].length).trim() : '';

    }
};

export default ContentApi;
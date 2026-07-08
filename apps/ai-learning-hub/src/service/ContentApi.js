const BASE_URL = 'http://localhost:3000/api';

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
        const targetUrl = useQueryParamStyle
            ? `${BASE_URL}/content?id=${contentId}`
            : `${BASE_URL}/content/${contentId}`;

        const res = await fetch(targetUrl);
        // Crucial: Pass 'false' because your backend explicitly returns text/plain 
        return handleResponse(res, false);
    },
};

export default ContentApi;
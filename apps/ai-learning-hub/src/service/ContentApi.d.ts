declare const ContentApi: {
    getContentIndex(): Promise<any>;
    getNavigation(): Promise<any>;
    getSearchIndex(): Promise<any>;
    getContentById(contentId: string, useQueryParamStyle?: boolean): Promise<any>;
    getContentIndexByPathFromGit(contentPath: string): Promise<any>;
    getContentByIdFromGit(contentId: string): Promise<any>;
};

export default ContentApi;
import {
    BadRequestException,
    Controller,
    Get,
    Query,
} from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('api')
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
    ) { }

    @Get('content-index')
    async getContentIndex() {
        return this.contentService.getContentIndex();
    }

    @Get('navigation')
    async getNavigation() {
        return this.contentService.getNavigation();
    }

    @Get('search-index')
    async getSearchIndex() {
        return this.contentService.getSearchIndex();
    }

    @Get('content')
    async getContent(
        @Query('id') contentId: string,
    ): Promise<string> {
        if (!contentId?.trim()) {
            throw new BadRequestException(
                'Query parameter "id" is required.',
            );
        }

        return this.contentService.getContent(contentId);
    }
}
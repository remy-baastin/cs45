import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async getApproved() {
    return this.faqsService.getAllApprovedFaqs();
  }

  @Post('search')
  async search(@Body() body: { query: string }) {
    return this.faqsService.searchSimilarFaqs(body.query);
  }

  @Post('feedback')
  async submitFeedback(
    @Body()
    body: {
      userId?: string;
      faqId: string;
      queryText: string;
      isHelpful: boolean;
      comments?: string;
      confidenceScore: number;
    },
  ) {
    return this.faqsService.submitFeedback(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async toggleBookmark(@Req() req: any, @Param('id') id: string) {
    return this.faqsService.toggleBookmark(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-bookmarked')
  async checkBookmark(@Req() req: any, @Param('id') id: string) {
    const isBookmarked = await this.faqsService.isBookmarked(req.user._id, id);
    return { bookmarked: isBookmarked };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @Post()
  async createFaq(
    @Req() req: any,
    @Body() body: { question: string; answer: string },
  ) {
    return this.faqsService.createFaq({
      question: body.question,
      answer: body.answer,
      approvedBy: req.user._id,
      isGenerated: false,
    });
  }
}

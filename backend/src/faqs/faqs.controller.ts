import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('FAQs')
@Controller('api/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all approved FAQs' })
  @ApiResponse({ status: 200, description: 'Returns list of all approved FAQ entries.' })
  async getApproved() {
    return this.faqsService.getAllApprovedFaqs();
  }

  @Post('search')
  @ApiOperation({ summary: 'Search FAQs using AI-powered similarity matching' })
  @ApiBody({ schema: { example: { query: 'how do I reset my password?' } } })
  @ApiResponse({ status: 200, description: 'Returns matching FAQs ranked by similarity score.' })
  async search(@Body() body: { query: string }) {
    return this.faqsService.searchSimilarFaqs(body.query);
  }

  @Post('smart-search')
  @ApiOperation({ summary: 'Advanced Smart Search Routing (FAQ -> RAG -> LLM)' })
  @ApiBody({ schema: { example: { query: 'Can I take a break for a wedding?' } } })
  @ApiResponse({ status: 200, description: 'Returns best match with routing information.' })
  async smartSearch(@Body() body: { query: string }) {
    return this.faqsService.smartSearch(body.query);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback on an FAQ (helpful or not)' })
  @ApiBody({
    schema: {
      example: {
        faqId: '6651abc123def456',
        queryText: 'how do I reset my password?',
        isHelpful: true,
        comments: 'Very clear explanation!',
        confidenceScore: 0.95,
        userId: '6651user123',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Feedback recorded successfully.' })
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
  @ApiBearerAuth('JWT-auth')
  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark on an FAQ (add or remove)' })
  @ApiParam({ name: 'id', description: 'FAQ ID to bookmark/unbookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark toggled. Returns bookmarked status.' })
  async toggleBookmark(@Req() req: any, @Param('id') id: string) {
    return this.faqsService.toggleBookmark(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get(':id/is-bookmarked')
  @ApiOperation({ summary: 'Check if the logged-in user has bookmarked a specific FAQ' })
  @ApiParam({ name: 'id', description: 'FAQ ID to check' })
  @ApiResponse({ status: 200, description: 'Returns { bookmarked: boolean }' })
  async checkBookmark(@Req() req: any, @Param('id') id: string) {
    const isBookmarked = await this.faqsService.isBookmarked(req.user._id, id);
    return { bookmarked: isBookmarked };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: '[Admin/Moderator] Manually create and publish a new FAQ' })
  @ApiBody({ schema: { example: { question: 'How do I reset my password?', answer: 'Click the forgot password link on the login page.' } } })
  @ApiResponse({ status: 201, description: 'FAQ created and published successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or moderator role.' })
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

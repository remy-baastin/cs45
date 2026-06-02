import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions(
    @Query('sort') sort?: 'recent' | 'upvoted' | 'unanswered',
  ) {
    return this.questionsService.getCommunityQuestions(sort || 'recent');
  }

  @UseGuards(JwtAuthGuard)
  @Get('votes')
  async getUserVotes(@Req() req: any) {
    return this.questionsService.getUserVotes(req.user._id);
  }

  @Get(':id')
  async getDetails(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.questionsService.getQuestionDetails(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async raiseQuery(
    @Req() req: any,
    @Body() body: { title: string; content: string },
  ) {
    return this.questionsService.raiseQuery(req.user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/answers')
  async submitAnswer(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.questionsService.submitAnswer(req.user._id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  async voteQuestion(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { value: number },
  ) {
    return this.questionsService.voteQuestion(req.user._id, id, body.value);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers/:answerId/vote')
  async voteAnswer(
    @Req() req: any,
    @Param('answerId') answerId: string,
    @Body() body: { value: number },
  ) {
    return this.questionsService.voteAnswer(req.user._id, answerId, body.value);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers/:answerId/accept')
  async acceptAnswer(@Req() req: any, @Param('answerId') answerId: string) {
    return this.questionsService.acceptAnswer(req.user._id, answerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async toggleBookmark(@Req() req: any, @Param('id') id: string) {
    return this.questionsService.toggleBookmark(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-bookmarked')
  async checkBookmark(@Req() req: any, @Param('id') id: string) {
    const isBookmarked = await this.questionsService.isBookmarked(req.user._id, id);
    return { bookmarked: isBookmarked };
  }
}

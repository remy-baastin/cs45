import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin', 'moderator')
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Roles('admin')
  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Roles('admin')
  @Patch('users/:id/ban')
  async toggleBan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.toggleUserBan(req.user._id, id, body.reason || '');
  }

  @Roles('admin', 'moderator')
  @Get('moderation/personal')
  async getPersonalQueries() {
    return this.adminService.getPersonalQueries();
  }

  @Roles('admin', 'moderator')
  @Post('moderation/personal/:id/review')
  async reviewPersonal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { answerContent: string },
  ) {
    return this.adminService.reviewPersonalQuery(req.user._id, id, body);
  }

  @Roles('admin', 'moderator')
  @Post('summarize/:discussionId')
  async summarizeDiscussion(
    @Req() req: any,
    @Param('discussionId') id: string,
  ) {
    return this.adminService.generateFaqFromDiscussion(req.user._id, id);
  }

  @Roles('admin', 'moderator')
  @Get('moderation/ai-faqs')
  async getGeneratedCandidates() {
    return this.adminService.getAiGeneratedFaqCandidates();
  }

  @Roles('admin', 'moderator')
  @Post('moderation/ai-faqs/:id/approve')
  async approveFaq(@Req() req: any, @Param('id') id: string) {
    return this.adminService.approveFaq(req.user._id, id);
  }

  @Roles('admin', 'moderator')
  @Delete('moderation/ai-faqs/:id')
  async rejectFaq(@Req() req: any, @Param('id') id: string) {
    return this.adminService.rejectFaq(req.user._id, id);
  }
}

import { Controller, Get, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getLeaderboard(lim);
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getNotifications(@Req() req: any) {
    return this.usersService.getNotifications(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.usersService.markNotificationAsRead(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  async getBookmarks(@Req() req: any) {
    return this.usersService.getBookmarks(req.user._id);
  }
}

import { Controller, Get, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top contributors ranked by reputation points' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to return (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Returns array of top users sorted by reputation.' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getLeaderboard(lim);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get a user profile by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the user' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns list of notifications.' })
  async getNotifications(@Req() req: any) {
    return this.usersService.getNotifications(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.usersService.markNotificationAsRead(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('bookmarks')
  @ApiOperation({ summary: 'Get all bookmarked FAQs and questions for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns list of bookmarked items.' })
  async getBookmarks(@Req() req: any) {
    return this.usersService.getBookmarks(req.user._id);
  }
}

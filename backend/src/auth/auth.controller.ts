import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ schema: { example: { email: 'user@example.com', passwordHash: 'mypassword123', name: 'John Doe' } } })
  @ApiResponse({ status: 201, description: 'User registered successfully, returns JWT token.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  async register(
    @Body() body: { email: string; passwordHash: string; name: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ schema: { example: { email: 'user@example.com', passwordHash: 'mypassword123' } } })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token and user info.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: { email: string; passwordHash: string }) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid.' })
  async getMe(@Req() req: any) {
    const user = req.user;
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      reputationPoints: user.reputationPoints,
      bio: user.bio,
    };
  }
}

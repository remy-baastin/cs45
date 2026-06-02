import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: { email: string; passwordHash: string; name: string }) {
    const existing = await this.userModel.findOne({ email: registerDto.email.toLowerCase().trim() });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(registerDto.passwordHash, salt);

    // Set first registered user to admin, for easy onboarding
    const count = await this.userModel.countDocuments();
    const role = count === 0 ? 'admin' : 'user';

    const newUser = new this.userModel({
      email: registerDto.email.toLowerCase().trim(),
      passwordHash: hash,
      name: registerDto.name.trim(),
      role,
      reputationPoints: 10, // Starting bonus points
    });

    const saved = await newUser.save();
    return this.generateToken(saved);
  }

  async login(loginDto: { email: string; passwordHash: string }) {
    const user = await this.userModel.findOne({ email: loginDto.email.toLowerCase().trim() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('This account has been banned');
    }

    const isMatch = await bcrypt.compare(loginDto.passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: UserDocument) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        reputationPoints: user.reputationPoints,
        bio: user.bio,
      },
    };
  }
}

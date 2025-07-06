import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from '../mail/mail.services';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService, // Inject ConfigService
  ) {}

  async register(dto: CreateUserDto): Promise<{ message: string }> {
    const { name, email, password } = dto;
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if(existingUser){
      throw new UnauthorizedException('User already exist! Please login.');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ name, email, password: hash });
    await this.userRepo.save(user);
    return { message: 'User registered' };
  }
  

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { access_token: token };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
  
    // Generate a separate token for password reset with a longer expiration
    // You might want to use a different secret for reset tokens for added security,
    // but for simplicity, we'll just extend the expiration here.
    const resetToken = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get<string>('JWT_SECRET'), // Ensure the same secret is used
        expiresIn: '1h', // Set a longer expiration, e.g., 1 hour
      },
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  
    await this.mailService.sendResetPasswordEmail(user.email, resetUrl);
  
    return { message: 'Reset link sent to email' };
  }
  
  async resetPassword(token: string, newPassword: string) {
    try {
      if (!token) {
        throw new BadRequestException('Password reset token is missing.');
      }
      // Verify the token using the same secret and ensure it's not expired
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'), // Ensure the same secret is used for verification
      }); 
  
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) throw new NotFoundException('User not found');
  
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await this.userRepo.save(user);
  
      return { message: 'Password reset successfully' };
    } catch (err) {
      console.error(err); // for debugging
      // JwtService.verify will throw an error if the token is invalid or expired.
      // The error object typically has a 'name' property like 'TokenExpiredError' or 'JsonWebTokenError'.
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token has expired. Please request a new one.');
      } else if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid password reset token.');
      } else {
        throw new BadRequestException('An unexpected error occurred during password reset.');
      }
    }
  }
}

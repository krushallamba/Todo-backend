import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
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
}

import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { EntityManager } from "@mikro-orm/core";

import * as bcrypt from "bcrypt";

import { User } from "@/common/entities/users.entity";
import { OtpService } from "@/otp/otp.service";
import { UsersService } from "@/users/users.service";

import { UniqueCodeService } from "../unique-code/unique-code.service";
import { AuthResponseDto, LoginDto, RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { IJwtPayload } from "./auth.interfaces";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly otpService: OtpService,
  ) {}

  private createToken(user: User): string {
    const payload: IJwtPayload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async registerStudent(registerStudentDto: RegisterStudentDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findUserByEmail(registerStudentDto.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const user = await this.authRepository.createStudent(registerStudentDto);
    const token = this.createToken(user);
    return new AuthResponseDto(user, token);
  }

  async registerTeacher(registerTeacherDto: RegisterTeacherDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findUserByEmail(registerTeacherDto.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const scopedEm = this.em.fork();

    try {
      await this.uniqueCodeService.validateAndIncrementUniqueCode(
        registerTeacherDto.email,
        registerTeacherDto.uniqueCode,
        scopedEm,
      );
      const user = await this.authRepository.createTeacher(registerTeacherDto);
      const token = this.createToken(user);
      return new AuthResponseDto(user, token);
    } catch (error) {
      if (error instanceof BadRequestException && error.message.includes("deleted")) {
        throw new BadRequestException("Unique code has expired. Please generate a new code.");
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.userService.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const token = this.createToken(user);
    return new AuthResponseDto(user, token);
  }

  async validateUser(email: string, password?: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return null;
    }
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }
    }
    return user;
  }

  async generateResetPasswordOtp(email: string): Promise<string> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException("No user found with this email.");
    }

    const otpCode = await this.otpService.generateOtp(email);
    return otpCode;
  }

  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<boolean> {
    const isValidOtp = await this.otpService.validateOtp(email, otpCode);
    if (!isValidOtp) {
      throw new BadRequestException("Invalid OTP.");
    }

    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException("No user found with this email.");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.em.persistAndFlush(user);
    return true;
  }
}

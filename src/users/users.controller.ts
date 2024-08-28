import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";

import { ITokenizedUser } from "@/auth/auth.interfaces";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateUserDto } from "./users.dtos";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: ITokenizedUser): ITokenizedUser {
    return user;
  }
}

import { Controller, Post, Body, UseGuards, Get, Put } from "@nestjs/common";

import { ITokenizedUser } from "@/auth/auth.interfaces";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { User } from "@/common/entities/users.entity";

import { CreateUserDto, EditUserDto, ResetPasswordDto } from "./users.dtos";
import { UsersSerializer } from "./users.serializer";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: ITokenizedUser): ITokenizedUser {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get("user-details")
  async getUserDetails(@CurrentUser() currentUser: { id: number }): Promise<User> {
    const user = await this.usersService.getDetails(currentUser.id);
    return this.usersSerializer.serialize(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put("edit")
  async editUser(
    @Body() editUserDto: EditUserDto,
    @CurrentUser() currentUser: { id: number },
  ): Promise<User> {
    const updatedUser = await this.usersService.editUser(currentUser.id, editUserDto);
    return this.usersSerializer.serialize(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put("reset-password")
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() currentUser: { id: number },
  ): Promise<void> {
    await this.usersService.resetPassword(currentUser.id, resetPasswordDto);
  }
}

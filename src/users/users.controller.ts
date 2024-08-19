import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from "@nestjs/common";

import { ITokenizedUser } from "@/auth/auth.interfaces";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";

import { RegisterUserDto, TokenizedUser, UserResponse } from "./users.dtos";
import { UsersSerializer } from "./users.serializer";
import { UsersService } from "./users.service";

@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  @Get("me")
  me(@CurrentUser() user: ITokenizedUser): TokenizedUser {
    return user;
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(EUserRole.SUPER_USER)
  async createUser(@Body() registerUserDto: RegisterUserDto): Promise<UserResponse> {
    const newUser = await this.usersService.createOne(registerUserDto);
    return this.usersSerializer.serialize(newUser);
  }
}

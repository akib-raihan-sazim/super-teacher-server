import { Controller, Post, Body } from "@nestjs/common";

import { CreateUserDto } from "./users.dtos";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
  }
}

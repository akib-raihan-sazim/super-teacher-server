import { TokenizedUser } from "@/users/users.dtos";

export class LoginResponseDto {
  accessToken!: string;
  user!: TokenizedUser;
}

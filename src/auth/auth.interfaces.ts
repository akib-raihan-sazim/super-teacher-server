export interface IJwtPayload {
  email: string;
  sub: number;
}

export interface ITokenizedUser {
  id: string;
  firstName: string;
  email: string;
  userType: "teacher" | "student";
}

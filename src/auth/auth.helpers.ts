import { ITokenizedUser } from "@/auth/auth.interfaces";
import { User } from "@/common/entities/users.entity";

export function makeTokenizedUser(user: User): ITokenizedUser {
  return {
    id: user.id,
    claim: user.userProfile.role.name,
    email: user.email,
    claimId: user.userProfile.role.id,
    userProfileId: user.userProfile.id,
  };
}

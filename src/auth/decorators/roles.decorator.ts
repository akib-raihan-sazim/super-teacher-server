import { SetMetadata } from "@nestjs/common";

import { EUserType } from "@/common/enums/users.enums";

export const ROLES_KEY = "roles";
export const Roles = (...roles: EUserType[]) => SetMetadata(ROLES_KEY, roles);

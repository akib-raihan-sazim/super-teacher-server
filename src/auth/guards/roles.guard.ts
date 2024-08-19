import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ITokenizedUser } from "@/auth/auth.interfaces";
import { ROLES_KEY } from "@/auth/decorators/roles.decorator";
import { EUserRole } from "@/common/enums/roles.enums";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<EUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as ITokenizedUser;
    return requiredRoles.includes(user.claim);
  }
}

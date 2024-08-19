import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger(this.constructor.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get("user-agent") || "";

    response.on("close", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");

      this.logger.log(
        `Method: ${method.toUpperCase()}, Path: ${url}, Status Code: ${statusCode}, Content Length: ${contentLength}, - [User Agent: ${userAgent}] [IP: ${ip}]`,
      );
    });

    next();
  }
}

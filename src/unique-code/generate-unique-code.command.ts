import { ConfigService } from "@nestjs/config";

import { EntityManager, MikroORM } from "@mikro-orm/core";

import { Command, CommandRunner, Option } from "nest-commander";

import { UniqueCodeService } from "./unique-code.service";

interface CommandOptions {
  email?: string;
  adminPassword?: string;
}

@Command({ name: "generate-unique-code", description: "Generate a unique code for a teacher" })
export class GenerateUniqueCodeCommand extends CommandRunner {
  constructor(
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly configService: ConfigService,
    private readonly orm: MikroORM,
  ) {
    super();
  }

  async run(passedParams: string[], options?: CommandOptions): Promise<void> {
    if (!options || !options.email || !options.adminPassword) {
      console.error("Email and admin password are required");
      process.exit(1);
      return;
    }

    const correctAdminPassword = this.configService.get<string>("ADMIN_PASSWORD");
    if (!correctAdminPassword) {
      console.error("ADMIN_PASSWORD is not set in the environment variables");
      process.exit(1);
      return;
    }

    if (options.adminPassword !== correctAdminPassword) {
      console.error("Invalid admin password");
      process.exit(1);
      return;
    }

    const em: EntityManager = this.orm.em.fork();

    try {
      const code = await this.uniqueCodeService.generateUniqueCode(options.email, em);
      console.log(`Unique code for ${options.email}: ${code}`);
      await em.flush();
      process.exit(0);
    } catch (error) {
      console.error(
        "Error generating unique code:",
        error instanceof Error ? error.message : "Unknown error",
      );
      process.exit(1);
    }
  }

  @Option({
    flags: "-e, --email <email>",
    description: "Email for the teacher",
  })
  parseEmail(val: string): string {
    return val;
  }

  @Option({
    flags: "-p, --admin-password <password>",
    description: "Admin password",
  })
  parseAdminPassword(val: string): string {
    return val;
  }
}

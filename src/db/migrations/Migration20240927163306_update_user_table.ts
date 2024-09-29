import { Migration } from "@mikro-orm/migrations";

export class Migration20240927163306_update_user_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "users" add column "gender" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop column "gender";');
  }
}

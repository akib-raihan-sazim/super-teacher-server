import { Migration } from "@mikro-orm/migrations";

export class Migration20240924100524_update_classroom_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "classrooms" add column "meet_link" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "classrooms" drop column "meet_link";');
  }
}

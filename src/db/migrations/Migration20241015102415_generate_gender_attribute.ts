import { Migration } from "@mikro-orm/migrations";

export class Migration20241015102415_generate_gender_attribute extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "users" add column "gender" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop column "gender";');
  }
}

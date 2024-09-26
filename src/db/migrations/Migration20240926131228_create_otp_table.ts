import { Migration } from "@mikro-orm/migrations";

export class Migration20240926131228_create_otp_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "otps" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "otp" varchar(255) not null, "email" varchar(255) not null, "expires_at" timestamptz not null);',
    );
    this.addSql('alter table "otps" add constraint "otps_otp_unique" unique ("otp");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "otps" cascade;');
  }
}

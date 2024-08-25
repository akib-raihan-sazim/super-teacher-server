import { Migration } from "@mikro-orm/migrations";

export class Migration20240825152858_update_student_column extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql('alter table "users" drop column "phone_number", drop column "address";');

    this.addSql(
      'alter table "students" add column "phone_number" varchar(255) not null, add column "address" varchar(255) not null;',
    );
    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql('alter table "students" drop column "phone_number", drop column "address";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );

    this.addSql(
      'alter table "users" add column "phone_number" varchar(255) not null, add column "address" varchar(255) not null;',
    );
  }
}

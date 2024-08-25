import { Migration } from "@mikro-orm/migrations";

export class Migration20240825150311_update_teacher_and_unique_code_columns extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "teachers" drop constraint "teachers_unique_code_id_foreign";');

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql('alter table "teachers" drop constraint "teachers_unique_code_id_unique";');
    this.addSql('alter table "teachers" drop column "unique_code_id";');

    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );

    this.addSql('alter table "teachers" add column "unique_code_id" int4 not null;');
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_id_foreign" foreign key ("unique_code_id") references "unique_codes" ("id") on update cascade on delete no action;',
    );
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_id_unique" unique ("unique_code_id");',
    );
  }
}

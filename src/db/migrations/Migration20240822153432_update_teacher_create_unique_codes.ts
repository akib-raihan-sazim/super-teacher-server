import { Migration } from "@mikro-orm/migrations";

export class Migration20240822153432_update_teacher_create_unique_codes extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "unique_codes" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" varchar(255) not null, "email" varchar(255) not null, "usage_count" int not null default 0);',
    );
    this.addSql(
      'alter table "unique_codes" add constraint "unique_codes_code_unique" unique ("code");',
    );

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql('alter table "teachers" drop constraint "teachers_unique_code_unique";');
    this.addSql('alter table "teachers" drop column "unique_code";');

    this.addSql('alter table "teachers" add column "unique_code_id" int not null;');
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_id_foreign" foreign key ("unique_code_id") references "unique_codes" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_id_unique" unique ("unique_code_id");',
    );

    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "teachers" drop constraint "teachers_unique_code_id_foreign";');

    this.addSql('drop table if exists "unique_codes" cascade;');

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );

    this.addSql('alter table "teachers" drop constraint "teachers_unique_code_id_unique";');
    this.addSql('alter table "teachers" drop column "unique_code_id";');

    this.addSql('alter table "teachers" add column "unique_code" varchar(255) not null;');
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_unique" unique ("unique_code");',
    );
  }
}

import { Migration } from "@mikro-orm/migrations";

export class Migration20240829174952_create_classrooms_enrollments_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "classrooms" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "subject" varchar(255) not null, "class_time" timestamptz not null, "days" text[] not null, "teacher_id" int not null);',
    );

    this.addSql(
      'create table "enrollments" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "student_id" int not null, "classroom_id" int not null);',
    );

    this.addSql(
      'alter table "classrooms" add constraint "classrooms_teacher_id_foreign" foreign key ("teacher_id") references "teachers" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "enrollments" add constraint "enrollments_student_id_foreign" foreign key ("student_id") references "students" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "enrollments" add constraint "enrollments_classroom_id_foreign" foreign key ("classroom_id") references "classrooms" ("id") on update cascade;',
    );

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "enrollments" drop constraint "enrollments_classroom_id_foreign";');

    this.addSql('drop table if exists "classrooms" cascade;');

    this.addSql('drop table if exists "enrollments" cascade;');

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );
  }
}

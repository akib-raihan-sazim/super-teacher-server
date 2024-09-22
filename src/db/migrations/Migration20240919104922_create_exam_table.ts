import { Migration } from "@mikro-orm/migrations";

export class Migration20240919104922_create_exam_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "exams" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "instruction" varchar(255) not null, "exam_date" timestamptz not null, "classroom_id" int not null);',
    );

    this.addSql(
      'alter table "exams" add constraint "exams_classroom_id_foreign" foreign key ("classroom_id") references "classrooms" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "exams" cascade;');
  }
}

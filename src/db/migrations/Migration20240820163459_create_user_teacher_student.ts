import { Migration } from "@mikro-orm/migrations";

export class Migration20240820163459_create_user_teacher_student extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "users" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(255) not null, "address" varchar(255) not null, "password" varchar(255) not null, "user_type" text check ("user_type" in (\'student\', \'teacher\')) not null);',
    );
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');

    this.addSql(
      'create table "teachers" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "unique_code" varchar(255) not null, "highest_education_level" varchar(255) not null, "major_subject" varchar(255) not null, "subjects_to_teach" text[] not null, "user_id" int not null);',
    );
    this.addSql(
      'alter table "teachers" add constraint "teachers_unique_code_unique" unique ("unique_code");',
    );
    this.addSql(
      'alter table "teachers" add constraint "teachers_user_id_unique" unique ("user_id");',
    );

    this.addSql(
      'create table "students" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "education_level" text check ("education_level" in (\'school\', \'college\', \'university\')) not null, "medium" text check ("medium" in (\'english\', \'bangla\')) null, "class" varchar(255) null, "degree" varchar(255) null, "degree_name" varchar(255) null, "semester" varchar(255) null, "user_id" int not null);',
    );
    this.addSql(
      'alter table "students" add constraint "students_user_id_unique" unique ("user_id");',
    );

    this.addSql(
      'alter table "teachers" add constraint "teachers_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "students" add constraint "students_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "teachers" drop constraint "teachers_user_id_foreign";');

    this.addSql('alter table "students" drop constraint "students_user_id_foreign";');

    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop table if exists "teachers" cascade;');

    this.addSql('drop table if exists "students" cascade;');
  }
}

import { Migration } from "@mikro-orm/migrations";

export class Migration20240911120337_create_message_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "messages" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "content" varchar(255) not null, "attachment_url" varchar(255) null, "sender_id" int not null, "classroom_id" int not null);',
    );

    this.addSql(
      'alter table "messages" add constraint "messages_sender_id_foreign" foreign key ("sender_id") references "users" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "messages" add constraint "messages_classroom_id_foreign" foreign key ("classroom_id") references "classrooms" ("id") on update cascade;',
    );

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "messages" cascade;');

    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );
  }
}

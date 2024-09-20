import { Migration } from "@mikro-orm/migrations";

export class Migration20240918072729_resource_table_update extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "resources" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "description" varchar(255) not null, "file_url" varchar(255) not null, "classroom_id" int not null);',
    );

    this.addSql(
      'alter table "resources" add constraint "resources_classroom_id_foreign" foreign key ("classroom_id") references "classrooms" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "resources" cascade;');
  }
}

import { Migration } from "@mikro-orm/migrations";

export class Migration20240821075736_update_student_entity extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      "alter table \"students\" add constraint \"students_medium_check\" check(\"medium\" in ('english', 'bangla', ''));",
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "students" drop constraint if exists "students_medium_check";');

    this.addSql(
      'alter table "students" add constraint "students_medium_check" check("medium" in (\'english\', \'bangla\'));',
    );
  }
}

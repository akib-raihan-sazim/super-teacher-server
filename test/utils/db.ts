import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export const truncateTables = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
): Promise<void> => {
  const dbConnection = dbService.getConnection();

  const tableNames: Array<{ table_name: string }> = await dbConnection.execute(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != 'mikro_orm_migrations';`,
  );

  for (const tableNameObj of tableNames) {
    await dbConnection.execute(
      `TRUNCATE TABLE "${tableNameObj.table_name}" RESTART IDENTITY CASCADE;`,
    );
  }
};

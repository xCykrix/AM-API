import { Connector } from "./lib/database/connector.ts";

// Load Database
await Connector.connect();
await Connector.client.execute(`
  CREATE DATABASE IF NOT EXISTS am_api;
`)
await Connector.client.execute(`
  USE am_api;
`)

async function check(id: string): Promise<0 | 1> {
  const r = await Connector.client.query(
    `SELECT * FROM rbx_migrations WHERE id = ?;`,
    [id]
  ).catch((r: Error) => {
    if (r.message.includes('doesn\'t exist')) return [];
    else throw r;
  });
  return r[0]?.migrated ?? 0 as 0 | 1;
}

async function doMigrationId(id: string): Promise<void> {
  const sql = Deno.readTextFileSync(`./lib/database/migrate/${id}`);
  console.info(`[vr1] Running Database Migration | ${id}`)
  await Connector.client.transaction(async (proc) => {
    const transact = sql.split(/^-- TRANSACT.*\n/gm);
    for (const trans of transact) {
      if (trans.trim() === '') continue;
      console.info('$', trans.trim());

      await proc.execute(trans.trim()).catch((v) => {
        console.error('Failed transaction! ${id}\nStack:', v);
        Deno.exit(1);
      });
    }
    await proc.execute(`INSERT IGNORE INTO rbx_migrations VALUES (?, ?)`, [id, 1]);
  }).catch((v) => {
    throw v;
  });
}

async function migrate(): Promise<void> {
  console.info('[vr1] Preparing to Migrate MySQL Database...')
  for (const sqlid of Deno.readDirSync('./lib/database/migrate/')) {
    if (!sqlid.isFile || !sqlid.name.endsWith('.sql')) continue;
    if (await check(sqlid.name) === 1) {
      console.info(`[vr1] Skipped '${sqlid.name}' as it has already been executed.`);
      continue;
    }
    await doMigrationId(sqlid.name)
  }
}

await migrate();

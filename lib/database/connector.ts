import { Client, configLogger } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
await configLogger({ enable: false });
export class Connector {
  public static client: Client = new Client();

  public static async connect(): Promise<void> {
    await configLogger({ enable: false });
    this.client = await this.client.connect({
      hostname: '192.168.68.61',
      username: 'root',
      password: 'RBX1Station',
      db: 'am_api',
      poolSize: 2,
    });
  }
}

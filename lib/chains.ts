import { Chain, RequestValidator, Resource } from '../deps.ts';

export class Chains {
  private static chain: RequestValidator;
  private static builder = Chain.builder();
  private static resources: (typeof Resource)[] = [];

  public static async link(): Promise<void> {
    for (const resourcef of Deno.readDirSync('./lib/resources/')) {
      if (!resourcef.isFile) continue;
      // deno-lint-ignore no-await-in-loop
      Chains.add((await import(`./resources/${resourcef.name}`)).group);
    }
  }

  public static add(...builders: (typeof Resource)[]): void {
    this.resources.push(...builders);
  }

  public static finalize(): void {
    this.builder.resources(...this.resources);
    this.chain = this.builder.build();
  }

  public static get(): RequestValidator {
    return this.chain;
  }
}

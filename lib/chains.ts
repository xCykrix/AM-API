import { Chain, RequestValidator, Resource } from '../deps.ts';

export class Chains {
  private static chain: RequestValidator;
  private static builder = Chain.builder();
  private static resources: (typeof Resource)[] = [];

  public static async link(): Promise<void> {
    for (const f of Deno.readDirSync('./lib/resources/')) {
      if (!f.isFile) continue;
      Chains.add((await import(`./resources/${f.name}`)).group);
    }
  }

  public static get(): RequestValidator {
    return this.chain;
  }

  public static add(...builders: (typeof Resource)[]): void {
    this.resources.push(...builders);
  }

  public static finalize(): void {
    this.builder.resources(...this.resources);
    this.chain = this.builder.build();
  }
}

import {
  Resource,
} from "https://esm.sh/@drashland/drash@3.0.0-beta.2/modules/chains/RequestChain/mod.native.js";

export class Bundler {
  public static open: (typeof Resource)[] = [];;
  public static authenticated: (typeof Resource)[] = [];

  public static register(resource: (typeof Resource), type: 'open' | 'authenticated'): void {
    if (type === 'open') this.open.push(resource);
    else this.authenticated.push(resource);
  }

  public static get(type: 'open' | 'authenticated'): (typeof Resource)[] {
    if (type === 'open') return this.open;
    else return this.authenticated;
  }
}

for (const resourcef of Deno.readDirSync('./lib/resources/')) {
  if (resourcef.isFile) {
    const bundled = await import(`./resources/${resourcef.name}`);
    for (const resource of (bundled.bundle as (typeof Resource)[])) {
      console.info(`Registered Bundled Class: ${resource.name} as ${bundled.type}`);
      Bundler.register(resource, bundled.type);
    }
  }
}

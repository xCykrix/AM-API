import {
  Resource,
} from "https://esm.sh/@drashland/drash@3.0.0-beta.2/modules/chains/RequestChain/mod.native.js";

/** Constants */
const nodeup = new Date();

class APIState extends Resource {
  public paths: string[] = ['/state'];

  public GET(request: Request) {
    return Response.json({
      node: {
        createdAt: nodeup,
      },
    })
  }
}

export const bundle = [APIState] as (typeof Resource)[];
export const type: 'open' | 'authenticated' = 'open';

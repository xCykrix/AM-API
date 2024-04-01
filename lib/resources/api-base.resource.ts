import {
  Resource,
} from "https://esm.sh/@drashland/drash/modules/chains/RequestChain/mod.native.js";

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

export const Bundled: (typeof Resource)[] = [APIState];
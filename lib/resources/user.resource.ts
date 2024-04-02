import {
  Resource,
} from "https://esm.sh/@drashland/drash@3.0.0-beta.2/modules/chains/RequestChain/mod.native.js";

class UserRegister extends Resource {
  public paths: string[] = ['/user/register'];

  public POST(request: Request) {
    return Response.json({
      user: 'yes!'
    })
  }
}

export const bundle = [UserRegister];
export const type: 'open' | 'authenticated' = 'open';

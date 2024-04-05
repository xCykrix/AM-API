import { encodeHex } from 'https://deno.land/std@0.221.0/encoding/hex.ts';
import { Resource, ulid } from '../../deps.ts';
import * as env from '../../env.json' with { type: 'json' };
import { database } from '../database/connector.ts';
import { Authenticate } from '../middleware/authenticate.ts';
import { jsonHTTPResponse } from '../util/json.ts';
import { getRandomString } from '../util/random.ts';
import { AuthenticatedRequest, ExtendedRequest } from '../util/request.ts';

class UserRegister extends Resource {
  public override paths: string[] = ['/api/user/register'];

  public override async POST(request: ExtendedRequest): Promise<Response> {
    const data = await request.formData();

    // Check e(mail) id is valid.
    if (data.get('eid') === null) {
      return jsonHTTPResponse(400, "Unable to validate 'eid'.", {
        eid: data.get('eid'),
      });
    }

    // Check Password and Password Repeat are valid.
    if (
      data.get('password') === null ||
      data.get('password') !== data.get('password_repeat')
    ) {
      return jsonHTTPResponse(
        400,
        "Unable to validate 'password' and 'password_repeat'.",
      );
    }

    // TODO(@xCykrix): Verify Optimizations
    // Hash Password to SHA-512 by 500 Iterables.
    let phash: BufferSource = new TextEncoder().encode(
      data.get('password')?.toString(),
    );
    for (let i = 0; i < 500; i++) {
      // deno-lint-ignore no-await-in-loop
      phash = await crypto.subtle.digest('SHA-512', phash);
    }
    const hash = encodeHex(phash as ArrayBuffer);
    const ehash = encodeHex(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(data.get('eid')!.toString())));
    const token = `${ehash}:1.${getRandomString(12)}.${getRandomString(12)}.${getRandomString(12)}`;

    // Insert User into Database
    const insert = await database.users.add({
      eid: data.get('eid')!.toString(),
      rid: ulid.ulid(),
      password: hash,
      token,
      authorization: env.default.elevation_id === data.get('elevate_id')?.toString() ? 'SUPERUSER' : 'BASIC',
    });
    if (!insert.ok) {
      return jsonHTTPResponse(409, 'Account Exists', {
        eid: data.get('eid')!.toString(),
      });
    }

    // Append Response
    return jsonHTTPResponse(200, 'Account Created', {
      eid: data.get('eid')!.toString(),
      token,
    });
  }
}

class UserGet extends Resource {
  public override paths: string[] = ['/api/user'];

  public override GET(request: AuthenticatedRequest): Response {
    delete request.user.password;
    return jsonHTTPResponse(200, 'User Context', {
      ...request.user,
    });
  }
}

class UserRegenerateToken extends Resource {
  public override paths: string[] = ['/api/user/regenerate-token'];

  public override async PUT(request: AuthenticatedRequest): Promise<Response> {
    const ehash = encodeHex(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(request.user.eid)));
    const token = `${ehash}:1.${getRandomString(12)}.${getRandomString(12)}.${getRandomString(12)}`;

    // Upsert to User
    database.users.updateByPrimaryIndex('token', request.user.token, {
      token,
    });

    return jsonHTTPResponse(200, 'User Token Regenerated', {
      eid: request.user.eid,
      token,
    });
  }
}

const unauthenticate = Resource.group()
  .resources(UserRegister)
  .build();

const authenticate = Resource.group()
  .resources(UserGet, UserRegenerateToken)
  .middleware(Authenticate)
  .build();

export const group = Resource.group()
  .resources(unauthenticate, authenticate)
  .build();

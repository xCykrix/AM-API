import { Resource } from '../deps.ts';
import { AuthenticationMiddleware } from '../lib/middleware/authenticate.ts';
import { jsonHTTPResponse } from '../lib/util/json.ts';
import { ExtendedRequest } from '../lib/util/request.ts';
import { AuthenticatedRequest } from '../lib/util/request.ts';

const kv = await Deno.openKv('./persistence/local-storage.kv');

class ImagePublic extends Resource {
  public override paths: string[] = ['/render/:id'];

  public override async GET(request: ExtendedRequest): Promise<Response> {
    const response = jsonHTTPResponse(200, 'GET IMAGE', {
      id: request.params.pathParam('id'),
    });
    return Response.json(response.content, response.alt);
  }
}

class ImageCreate extends Resource {
  public override paths: string[] = ['/create'];

  public override async POST(request: AuthenticatedRequest): Promise<Response> {
    const data = await request.formData();
    const file = data.get('image')! as File;
    let iid = '';
    let result = { ok: false };
    while (!result.ok) {
      iid = crypto.randomUUID();
      // deno-lint-ignore no-await-in-loop
      result = await kv.atomic()
        .check({ key: [iid], versionstamp: null })
        .set([iid], {
          gid: request.user.gid,
          blob: file.arrayBuffer(),
        })
        .commit();
    }
    console.info('uploaded image to iid for gid')
    return new Response();
  }
}

class ImageManage extends Resource {
  public override paths: string[] = ['/manage/:id'];

  public override async POST(request: AuthenticatedRequest): Promise<Response> {
    const response = jsonHTTPResponse(200, 'CREATE IMAGE', {
      id: request.params.pathParam('id'),
    });
    return Response.json(response.content, response.alt);
  }
}

export const unauthenticated = Resource.group()
  .resources(ImagePublic)
  .build();

export const authenticated = Resource.group()
  .resources(ImageCreate, ImageManage)
  .build();

export const group = Resource.group()
  .resources(unauthenticated, authenticated)
  .pathPrefixes('/api/image')
  .build();

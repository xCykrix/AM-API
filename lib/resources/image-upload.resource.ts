import { Resource, hex } from '../../deps.ts';
import { database } from '../database/connector.ts';
import { Authenticate } from '../middleware/authenticate.ts';
import { jsonHTTPResponse } from '../util/json.ts';
import { AuthenticatedRequest, ExtendedRequest } from '../util/request.ts';

class ImageRender extends Resource {
  public override paths: string[] = ['/api/image/render/:id'];

  public override async GET(request: ExtendedRequest): Promise<Response> {
    const read = await database.image.findByPrimaryIndex('iid', request.params.pathParam('id')!);
    if (read === null) return jsonHTTPResponse(404, 'Image Not Found');
    return new Response(read!.value.buffer, {
      headers: {
        'Content-Type': read!.value.type!,
      }
    });
  }
}

class ImageList extends Resource {
  public override paths: string[] = ['/api/image'];

  public override async GET(request: AuthenticatedRequest): Promise<Response> {

    // Append Response
    return jsonHTTPResponse(200, 'Image List', {
      data: true,
    });
  }
}


class ImageUpload extends Resource {
  public override paths: string[] = ['/api/image/upload'];

  public override async POST(request: AuthenticatedRequest): Promise<Response> {
    const data = await request.formData().catch(() => {
      return null;
    });
    const file = data?.get('Image') as File | null;
    if (data === null || file === null) return jsonHTTPResponse(400, 'Missing FormData Element', {
      required: ['Image (File)']
    });

    // Ensure File is Valid Type
    if (file!.type !== 'image/png' && file!.type !== 'image/jpeg') return jsonHTTPResponse(400, 'Invalid File Type in FormData', {
      type: file.type,
    });

    // Encode File to Hex
    const buffer = new Uint8Array(await file!.arrayBuffer());
    const hash = hex.encodeHex(await crypto.subtle.digest('SHA-256', buffer));

    // Insert to Database
    const insert = await database.image.add({
      rid: request.user.rid,
      iid: hash,
      buffer: buffer,
      type: file!.type,
    });
    if (!insert.ok) return jsonHTTPResponse(409, 'Duplicate Hash Uploaded', {
      hash,
    })

    // Append Response
    return jsonHTTPResponse(200, 'Image Upload', {
      hash,
    });
  }
}

class ImageDelete extends Resource {
  public override paths: string[] = ['/api/image/delete'];

  public override async DELETE(request: AuthenticatedRequest): Promise<Response> {
    const data = await request.formData().catch(() => {
      return null;
    });
    const id = data?.get('Image-ID') as string | null;
    if (data === null || id === null) return jsonHTTPResponse(400, 'Missing FormData Element', {
      required: ['Image-ID (String)']
    });

    const read = await database.image.findByPrimaryIndex('iid', id);
    if (read === null || read.value.rid !== request.user.rid) return jsonHTTPResponse(404, 'Image Not Found', {
      'Image-ID': id,
    });
    await database.image.deleteByPrimaryIndex('iid', id);

    return jsonHTTPResponse(200, 'Image Deleted');
  }
}

const unauthenticate = Resource.group()
  .resources(ImageRender)
  .build();

const authenticate = Resource.group()
  .resources(ImageList, ImageUpload, ImageDelete)
  .middleware(Authenticate)
  .build();

export const group = Resource.group()
  .resources(unauthenticate, authenticate)
  .build();

import { hex, Resource } from '../../deps.ts';
import { database } from '../database/connector.ts';
import { Authenticate } from '../middleware/authenticate.ts';
import { jsonHTTPResponse } from '../util/json.ts';
import { getRandomString } from '../util/random.ts';
import { AuthenticatedRequest, ExtendedRequest } from '../util/request.ts';

class BucketRead extends Resource {
  public override paths: string[] = ['/api/bucket/:id'];

  public override async GET(request: ExtendedRequest): Promise<Response> {
    // Read Image from Bucket.
    const readBucket = await database.bucket.findByPrimaryIndex('iid', request.params.pathParam('id')!);
    if (readBucket === null) return jsonHTTPResponse(404, 'Content Not Found');

    // Check for Blob Storage.
    const readStorage = await database.uint8.find(readBucket.value.bid);
    if (readStorage === null) return jsonHTTPResponse(404, 'Content Not Found');

    // Return Blob Value.
    return new Response(readStorage.value, {
      headers: {
        'Content-Type': readBucket.value.type,
      },
    });
  }
}

class BucketManage extends Resource {
  public override paths: string[] = ['/api/bucket'];

  public override async GET(request: AuthenticatedRequest): Promise<Response> {
    // Get All Entries by rid.
    const read = await database.bucket.getMany({
      filter: (doc) => {
        return doc.value.rid === request.user.rid;
      },
    });

    // Return Results.
    return jsonHTTPResponse(200, 'Bucket List', {
      result: read.result,
    });
  }

  public override async POST(request: AuthenticatedRequest): Promise<Response> {
    // Read Form and File.
    const form = await request.formData().catch(() => null);
    const file = form?.get('File') as File | null;
    if (form === null || file === null) {
      return jsonHTTPResponse(400, 'Missing FormData Element', {
        fields: ['File - File()'],
      });
    }

    // Encode File to Hex Hash. Generate Deletion ID.
    const buffer = new Uint8Array(await file.arrayBuffer());
    const contentId = hex.encodeHex(await crypto.subtle.digest('SHA-256', buffer));
    const deletionId = getRandomString(16);

    // Insert Buffer to Database.
    const writeStorage = await database.uint8.add(buffer, {
      batched: true,
    });
    if (!writeStorage.ok) return jsonHTTPResponse(500, 'Failed to Write File Blob to Database');

    // Insert to Database.
    const writeBucket = await database.bucket.add({
      rid: request.user.rid,
      iid: contentId,
      bid: writeStorage.id.toString(),
      did: deletionId,
      type: file!.type,
    }, {
      batched: true,
    });
    if (!writeBucket.ok) {
      return jsonHTTPResponse(409, 'Duplicate Hash Uploaded', {
        contentId,
      });
    }

    // Return Content and Deletion IDs.
    return jsonHTTPResponse(200, 'Content Uploaded', {
      iid: contentId,
      did: deletionId,
    });
  }
}

class BucketDelete extends Resource {
  public override paths: string[] = ['/api/bucket/delete/:id/:did'];

  public override async GET(request: AuthenticatedRequest): Promise<Response> {
    // Read Image ID and Deletion ID.
    const iid = request.params.pathParam('id')!;
    const did = request.params.pathParam('did')!;

    // Read Image from Bucket. Validate DID.
    const readBucket = await database.bucket.findByPrimaryIndex('iid', iid);
    if (readBucket === null) {
      return jsonHTTPResponse(404, 'Content Not Found', {
        iid: iid,
      });
    }
    if (readBucket.value.did !== did) return jsonHTTPResponse(403, 'Unauthorized Deletion Request');

    // Delete Content and Bucket.
    await database.uint8.delete(readBucket.value.bid);
    await database.bucket.delete('iid', readBucket.id);

    // Return NO-OP 200.
    return jsonHTTPResponse(200, 'Content Deleted');
  }
}

const unauthenticate = Resource.group()
  .resources(BucketRead, BucketDelete)
  .build();

const authenticate = Resource.group()
  .resources(BucketManage, BucketDelete)
  .middleware(Authenticate)
  .build();

export const group = Resource.group()
  .resources(unauthenticate, authenticate)
  .build();

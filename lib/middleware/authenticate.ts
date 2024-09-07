import { Middleware } from '../../deps.ts';
import { database } from '../database/connector.ts';
import { jsonHTTPResponse } from '../util/json.ts';
import { AuthenticatedRequest } from '../util/request.ts';

export class Authenticate extends Middleware {
  public override async ALL(request: AuthenticatedRequest): Promise<unknown> {
    const authentication: string = request.headers.get('Authentication')?.toString() ?? 'NID:NID';
    const user = await database.users.findByPrimaryIndex('token', authentication);
    if (!user) return jsonHTTPResponse(401, 'Unauthorized or Revoked');

    // Apply User to Request
    request.user = user.value;

    return super.ALL(request);
  }
}

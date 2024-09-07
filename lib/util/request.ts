import { WithParams } from '../../deps.ts';
import { User } from '../database/model/user.ts';

export interface ExtendedRequest extends Request, WithParams {
}

export interface AuthenticatedRequest extends ExtendedRequest {
  user: User;
}

import { WithParams } from 'https://raw.githubusercontent.com/drashland/drash/main/src/standard/handlers/RequestParamsParser.ts';
import { User } from '../database/model/user.ts';

export interface ExtendedRequest extends Request, WithParams {
}

export interface AuthenticatedRequest extends ExtendedRequest {
  user: User
}

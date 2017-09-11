import * as Requests from 'app/requests/sessions';
import BaseService from 'gearworks-http';
import Paths from '../../shared/paths';
import { AUTH_HEADER_NAME } from '../../shared/constants';
import { SessionTokenResponse } from 'gearworks-route';

export class SessionsApi extends BaseService {
    constructor(authToken?: string) {
        super(Paths.api.sessions.base, !!authToken ? { [AUTH_HEADER_NAME]: authToken } : undefined);
    }

    public create = (data: Requests.CreateSession) => this.sendRequest<SessionTokenResponse>(Paths.api.sessions.paths.create, "POST", { body: data });
}
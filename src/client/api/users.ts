import * as Requests from 'app/requests/users';
import BaseService from 'gearworks-http';
import Paths from '../../shared/paths';
import { AUTH_HEADER_NAME } from '../../shared/constants';
import { SessionTokenResponse } from 'gearworks-route/bin';

export class UsersApi extends BaseService {
    constructor(authToken?: string) {
        super(Paths.api.users.base, !!authToken ? { [AUTH_HEADER_NAME]: authToken } : undefined);
    }

    public create = (data: Requests.CreateAccount) => this.sendRequest<SessionTokenResponse>(Paths.api.users.paths.create, "POST", { body: data });

    public getIntegrationUrl = () => this.sendRequest<Requests.GetIntegrationUrlResponse>(Paths.api.users.paths.getIntegrationLink, "GET")

    public finalizeIntegration = (data: Requests.FinalizeIntegrationQuery) => this.sendRequest<SessionTokenResponse>(Paths.api.users.paths.finalizeIntegration, "POST", { qs: data })
}
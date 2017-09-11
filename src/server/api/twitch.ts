import BaseService from 'gearworks-http';
import { StreamsResponse } from 'twitch';

export class Twitch extends BaseService {
    constructor(private client_id, private client_secret, private auth_token?: string) {
        super("https://api.twitch.tv/kraken", !!auth_token ? {
            "Authorization": `OAuth ${auth_token}`,
        } : undefined);
    }

    authorize = (data: {
        redirect_uri: string,
        code: string,
        state: string,
    }) => this.sendRequest<{ access_token: string, scopes: string[] }>(`oauth2/token`, "POST", { body: { ...data, grant_type: "authorization_code", client_id: this.client_id, client_secret: this.client_secret } });

    listFollowerStreams = (data?: {
        limit?: number;
        offset?: number;
        stream_type?: "all" | "playlist" | "live"
    }) => this.sendRequest<StreamsResponse>(`streams/followed`, "GET", { qs: data });
}
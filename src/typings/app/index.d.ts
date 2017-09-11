declare module "app" {
    import { Enums } from "shopify-prime/dist";
    import { CouchDoc } from "davenport";

    export interface User extends CouchDoc {
        /**
         * The date the user's account was created.
         */
        date_created: string;

        /**
         * The user's hashed password.
         */
        hashed_password: string;

        twitch_oauth_state: string;

        twitch_access_token: string;
    }
}

declare module "app/requests/users" {
    import { SessionTokenResponse } from "gearworks-route"

    export interface CreateAccount {
        username: string;
        password: string;
    }

    export interface GetIntegrationUrlResponse extends SessionTokenResponse {
        url: string
    }

    export interface FinalizeIntegrationQuery {
        code: string
        state: string
        scope: string
    }
}

declare module "app/requests/sessions" {
    export interface CreateSession {
        username: string;
        password: string;
    }
}
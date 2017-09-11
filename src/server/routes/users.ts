import * as boom from 'boom';
import * as Constants from '../../shared/constants';
import * as gwv from 'gearworks-validation';
import * as qs from 'qs';
import * as Requests from 'app/requests/users';
import inspect from 'logspect';
import Paths from '../../shared/paths';
import { ApiError } from 'gearworks-http/bin';
import { createSessionToken, RouterFunction } from 'gearworks-route/bin';
import { Express } from 'express';
import { hashSync } from 'bcryptjs';
import { Twitch } from '../api/twitch';
import { User } from 'app';
import { UserDb } from '../database';
import { v4 as guid } from 'node-uuid';

interface ResetToken {
    exp: number;
    username: string;
}

export default function registerRoutes(app: Express, route: RouterFunction<User>) {
    route({
        label: "Create user",
        method: "post",
        path: Paths.api.users.base + Paths.api.users.paths.create,
        requireAuth: false,
        bodyValidation: gwv.object<Requests.CreateAccount>({
            username: gwv.string().email().required(),
            password: gwv.string().min(6).max(100).required(),
        }),
        handler: async function (req, res, next) {
            const model: Requests.CreateAccount = req.validatedBody;

            if (await UserDb.exists(model.username.toLowerCase())) {
                return next(boom.badData(`A user with that username already exists.`));
            }

            const user: User = {
                _id: model.username.toLowerCase(),
                hashed_password: hashSync(model.password),
                date_created: new Date().toISOString(),
                twitch_access_token: undefined,
                twitch_oauth_state: undefined
            }
            const createResult = await UserDb.post(user);

            await res.withSessionToken({ ...user, _id: createResult.id, _rev: createResult.rev });

            return next();
        }
    });

    route({
        label: "Get Twitch oAuth request URL",
        method: "get",
        path: Paths.api.users.base + Paths.api.users.paths.getIntegrationLink,
        requireAuth: true,
        handler: async function (req, res, next) {
            // Store the state and redirect_uri somewhere and give it an id that then gets passed as the state to the Twitch oauth URL.
            const state = guid();
            const updatedUser: User = { ...req.user, twitch_oauth_state: state }
            const userUpdate = await UserDb.put(req.user._id, updatedUser, req.user._rev);
            const sessionToken = await createSessionToken({ ...updatedUser, _rev: userUpdate.rev }, {
                iron_password: Constants.IRON_PASSWORD,
                jwt_secret_key: Constants.JWT_SECRET_KEY,
                sealable_user_props: Constants.SEALABLE_USER_PROPERTIES
            })

            // Stringify everything twitch needs for oauth
            const twitchQuery = qs.stringify({
                response_type: "code",
                client_id: Constants.TWITCH_CLIENT_ID,
                scope: "user_read",
                state: state,
                force_verify: true,
                redirect_uri: req.domainWithProtocol + Paths.signup.finalizeIntegration,
            });
            const twitchAuthUrl = `https://api.twitch.tv/kraken/oauth2/authorize?${twitchQuery}`;

            res.json<Requests.GetIntegrationUrlResponse>({ url: twitchAuthUrl, token: sessionToken.token })

            return next();
        }
    })

    route({
        label: "Finalize twitch integration",
        method: "post",
        path: Paths.api.users.base + Paths.api.users.paths.finalizeIntegration,
        requireAuth: true,
        queryValidation: gwv.object<Requests.FinalizeIntegrationQuery>({
            code: gwv.string().required(),
            state: gwv.string().required(),
            scope: gwv.stringOrEmpty(),
        }),
        handler: async function (req, res, next) {
            const query: Requests.FinalizeIntegrationQuery = req.validatedQuery

            // Ensure the state value matches
            if (query.state !== req.user.twitch_oauth_state) {
                return next(boom.badRequest(`OAuth state value does not match. Received: ${query.state}. Expected: ${req.user.twitch_oauth_state}`))
            }

            const api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET);
            let token: string;

            try {
                const result = await api.authorize({
                    code: req.query.code,
                    state: req.query.state,
                    redirect_uri: req.domainWithProtocol + Paths.signup.finalizeIntegration,
                })

                token = result.access_token;
            } catch (_e) {
                const e: ApiError = _e;

                inspect("Error authorizing Twitch integration.", e);

                return next(boom.badGateway(e.message));
            }

            // Store the Twitch account token in the database
            const updatedUser: User = { ...req.user, twitch_access_token: token };
            const updateResult = await UserDb.put(req.user._id, updatedUser, req.user._rev);

            await res.withSessionToken({ ...updatedUser, _rev: updateResult.rev });

            return next();
        }
    })
}
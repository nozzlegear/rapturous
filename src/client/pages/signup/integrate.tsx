import * as React from 'react';
import * as Requests from 'app/requests/users';
import Box from '../../components/box';
import Router from '../../components/router';
import { ApiError } from 'gearworks-http';
import { AuthStore } from '../../stores';
import { blueGrey700 } from 'material-ui/styles/colors';
import { CircularProgress, FontIcon, RaisedButton } from 'material-ui';
import { parse } from 'qs';
import { UsersApi } from '../../api/index';

export interface IProps {
    type: "get-link" | "finalize"
}

export interface IState {
    error?: string;
}

export default class FinalizePage extends Router<IProps, IState> {
    state: IState = {};

    async componentDidMount() {
        const finalizing = this.props.type === "finalize";
        const api = new UsersApi(AuthStore.token)
        const qs = parse(window.location.search.replace(/^\?/i, "")) as Requests.FinalizeIntegrationQuery
        let token: string;
        let url: string;

        try {
            if (finalizing) {
                const result = await api.finalizeIntegration(qs)

                token = result.token
            } else {
                const result = await api.getIntegrationUrl();

                token = result.token;
                url = result.url;
            }
        } catch (_e) {
            const e: ApiError = _e;

            this.setState({ error: e.message })

            if (e.unauthorized) {
                this.handleUnauthorized(finalizing ? this.PATHS.signup.finalizeIntegration : this.PATHS.signup.getIntegrationLink, qs)
            }

            return;
        }

        AuthStore.login(token);

        if (finalizing) {
            this.context.router.replace(this.PATHS.home.index)
        } else {
            window.location.href = url
        }
    }

    private tryAgain(e: React.FormEvent<any> | React.MouseEvent<any>) {
        e.preventDefault();

        this.context.router.push(this.PATHS.signup.getIntegrationLink);
    }

    public render() {
        const { error } = this.state;
        const finalizing = this.props.type === "finalize";
        const padding = "50px";
        let action: JSX.Element;

        if (error) {
            action = <RaisedButton primary={true} fullWidth={true} label="Try again" onTouchTap={(e) => this.tryAgain(e)} />;
        }

        return (
            <section id="signup">
                <div className="pure-g center-children">
                    <div className="pure-u-1-1 pure-u-md-12-24">
                        <Box title={finalizing ? `Connecting your Twitch account.` : `Contacting Twitch servers.`} description="Please wait." footer={action} error={error}>
                            <div style={{ paddingTop: padding, paddingBottom: padding, textAlign: "center" }}>
                                {!error ? <CircularProgress /> : <FontIcon className="fa fa-frown-o" color={blueGrey700} style={{ fontSize: "6em" }} />}
                            </div>
                        </Box>
                    </div>
                </div>
            </section>
        );
    }
}
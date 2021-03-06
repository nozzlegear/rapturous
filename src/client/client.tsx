import * as React from 'react';
import AuthPage from './pages/auth';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import ErrorPage from './pages/error';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import HomePage from './pages/home';
import IntegratePage from './pages/signup/integrate';
import IntegrationPage from './pages/signup/integrate';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Navbar from './components/nav';
import Paths from '../shared/paths';
import SignupPage from './pages/signup';
import { APP_NAME } from '../shared/constants';
import { AuthStore, DashboardStore } from './stores';
import {
    browserHistory,
    IndexRoute,
    Link,
    Redirect,
    Route,
    Router,
    RouterContext
    } from 'react-router';
import { Provider } from 'mobx-react';
import { render as renderComponent } from 'react-dom';
// Material-UI needs the react-tap-event-plugin activated
require("react-tap-event-plugin")();
// Inject TVJS for Xbox One directional navigation
require("./vendor/tvjs-1.0.0.0.js")
// Inject CSS
require("./css/all.styl")

export const THEME = getMuiTheme(baseTheme);

// Main app component
export default function Main(props) {
    return (
        <main id="app">
            <Navbar />
            {React.cloneElement(props.children, props)}
            <footer id="footer">
                <div>
                    <p>
                        {`© ${APP_NAME}, ${new Date().getUTCFullYear()}. All rights reserved.`}
                    </p>
                    <p>
                        {"Powered by "}
                        <a target="_blank" href="https://github.com/nozzlegear/gearworks">
                            {"Gearworks"}
                        </a>
                        {"."}
                    </p>
                </div>
            </footer>
        </main>
    )
}

export function MinimalMain(props) {
    return (
        <main id="app" className="minimal">
            <div id="body">
                <div className="page-header">
                    <h1>
                        <Link to={Paths.home.index}>{APP_NAME}</Link>
                    </h1>
                </div>
                {React.cloneElement(props.children as any, props)}
            </div>
        </main>
    )
}

(function () {
    function checkAuthState(requireTwitchIntegration: boolean) {
        return (args: Router.RouterState, replace: Router.RedirectFunction, callback: Function) => {
            if (AuthStore.sessionIsInvalid) {
                replace(Paths.auth.login + window.location.search);
            } else if (requireTwitchIntegration && !AuthStore.session.twitch_access_token) {
                replace(Paths.signup.getIntegrationLink + window.location.search);
            }

            callback();
        }
    }

    function logout(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function) {
        AuthStore.logout();
        replace(Paths.auth.login);

        callback();
    }

    const routes = (
        <Provider {...{ auth: AuthStore, dashboard: DashboardStore }}>
            <MuiThemeProvider muiTheme={THEME}>
                <Router history={browserHistory}>
                    <Route component={Main}>
                        <Route onEnter={checkAuthState(true)} >
                            <Route path={Paths.home.index} component={HomePage} onEnter={args => document.title = APP_NAME} />
                        </Route>
                    </Route>
                    <Route component={MinimalMain}>
                        <Route path={Paths.auth.login} component={AuthPage} onEnter={(args) => { document.title = "Login" }} />
                        <Route path={Paths.signup.index} component={SignupPage} onEnter={args => document.title = "Signup"} />
                        <Route onEnter={checkAuthState(false)}>
                            <Route path={Paths.signup.getIntegrationLink} component={props => <IntegratePage type={"get-link"} {...props} />} onEnter={args => document.title = "Contacting Twitch servers."} />
                            <Route path={Paths.signup.finalizeIntegration} component={props => <IntegratePage type={"finalize"} {...props} />} onEnter={args => document.title = "Connecting your Twitch account."} />
                        </Route>
                        <Route path={"/error/:statusCode"} component={ErrorPage} onEnter={(args) => { document.title = `Error ${args.params["statusCode"]} | ${APP_NAME}` }} />
                    </Route>
                    <Route path={Paths.auth.logout} onEnter={logout} />
                    <Redirect path={"*"} to={"/error/404"} />
                </Router>
            </MuiThemeProvider>
        </Provider>
    )

    renderComponent(routes, document.getElementById("contenthost"));
}())
import * as React from 'react';
import Paths from '../../shared/paths';
import { APP_NAME } from '../../shared/constants';
import { AuthStore } from '../stores';
import { Link } from 'react-router';
import {
    AppBar,
    Drawer,
    MenuItem,
    Divider,
} from "material-ui";

export interface IProps {

}

export interface IState {
    drawerOpen?: boolean;
}

export default class Nav extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.configureState(props, false);
    }

    public state: IState = {};

    //#region Utility functions

    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {}

        if (!useSetState) {
            this.state = state;

            return;
        }

        this.setState(state);
    }

    //#endregion

    public componentDidMount() {

    }

    public componentDidUpdate() {

    }

    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }

    public render() {
        const props = this.props;

        return (
            <div>
                <AppBar title={APP_NAME} onLeftIconButtonTouchTap={e => this.setState({ drawerOpen: true })} />
                <Drawer open={this.state.drawerOpen} docked={false} disableSwipeToOpen={true} onRequestChange={open => this.setState({ drawerOpen: open })}>
                    <AppBar onLeftIconButtonTouchTap={e => this.setState({ drawerOpen: false })} title={APP_NAME} />
                    <MenuItem
                        {...{ containerElement: <Link to={Paths.home.index} /> }}
                        primaryText="VODs" />
                    <Divider />>
                    <MenuItem
                        {...{ containerElement: <Link to={AuthStore.token ? Paths.auth.logout : Paths.auth.login} /> }}
                        primaryText={AuthStore.token ? "Sign out" : "Sign in"} />
                </Drawer>
            </div>
        )
    }
}
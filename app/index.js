import React, { Component } from 'react';
import { I18nManager } from "react-native";
import { Root } from "./config/router";
import RNRestart from 'react-native-restart';
I18nManager.forceRTL(true);
if (!I18nManager.isRTL) {
    RNRestart.Restart();
}
export default class App extends Component {
    render() {
        const Layout = Root();
        return <Layout />;
    }
}


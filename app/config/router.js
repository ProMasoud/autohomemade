import React from "react";
import { StackNavigator } from "react-navigation";
import CardStackStyleInterpolator from "react-navigation/src/views/CardStack/CardStackStyleInterpolator";

import Home from "../screens/Home";
import EmergencyCall from "../screens/EmergencyCall";
import DrugPlans from "../screens/DrugPlans";
import GeneralSettings from "../screens/GeneralSettings";
import DrugInfo from "../screens/DrugInfo";
import DrugBox from "../screens/DrugBox";

export const Root = () => {
    return StackNavigator(
        {
            Home: {
                screen: Home
            },
            DrugInfo: {
                screen: DrugInfo
            },
            DrugBox: {
                screen: DrugBox
            },
            EmergencyCall: {
                screen: EmergencyCall
            },
            DrugPlans: {
                screen: DrugPlans
            },
            GeneralSettings: {
                screen: GeneralSettings
            }
        },
        {
            headerMode: "none",
            mode: "modal",
            initialRouteName: "Home"
        }
    );
};

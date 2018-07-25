import React from 'react';
import { StackNavigator } from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';

import Home from '../screens/Home';
import EmergencyCall from '../screens/EmergencyCall';
import DrugPlans from '../screens/DrugPlans';
import GeneralSettings from '../screens/GeneralSettings';



export const Root = () => {
    return StackNavigator(
        {
            Home: {
                screen: Home,
            },
            EmergencyCall: {
                screen: EmergencyCall,
            },
            DrugPlans: {
                screen: DrugPlans,
            },
            GeneralSettings: {
                screen: GeneralSettings,
            },
            
        },
        {
            headerMode: "none",
            mode: "modal",
            initialRouteName: "Home"
        }
    );
};

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';



export default class DrugPlans extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }


    componentDidMount() {

    }

    render() {
        return (
            <View style={st.container}>
                <View elevation={5} style={st.header}>
                    <Text style={st.headerText} >
                        مشاهده برنامه ها
                    </Text>
                </View>
            </View>
        );
    }
}

const st = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#43a9ff',
        height: 56
    },
    headerText: {
        fontFamily: 'Iransans',
        fontSize: 25,
        color: '#fff'
    },
});

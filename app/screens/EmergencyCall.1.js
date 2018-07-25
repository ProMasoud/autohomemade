import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, BackHandler, Alert, Dimensions, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import DB from "./../model/DbConfig";
import SendSMS from 'react-native-sms'

const { width } = Dimensions.get('window');

export default class EmergencyCall extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isEnabled: false,
            phoneNumber: false,
            text: "",
            textMessage: "",
        }
        
    }

    componentDidMount() {
        this.MS_PHONE_NUM()                      
        this.fillInputs()  
    }

    _sendSMS = (text) => {

        SendSMS.send({
            body: text,
            recipients: [this.state.phoneNumber],
            successTypes: ['sent', 'queued']
        }, (completed, cancelled, error) => {
    
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
            Alert.alert(
                'موفق',
                'اطلاعات وارد شده با موفقیت ثبت شد.',
                [
                    { text: 'باشه!', onPress: () => {
                            this.props.navigation.navigate("Home")
                        }
                    }
                ],
                { cancelable: false }
            )
            return
        });
    }

    fillInputs = () => {
        DB.transaction((tx) => {
            tx.executeSql("SELECT * FROM settings where `key` = ?", ["sosMessageText"], (tx, res) => {
                if (res.rows.length > 0) {
                    var num = {};
                    num["sosMessageText"] = res.rows.item(0).value;
                    this.setState(num);
                } else {
                    tx.executeSql("insert into settings (`key`, value) values (?, ?)", ["sosMessageText", ""]);
                    var num = {};
                    num["sosMessageText"] = "";
                    this.setState(num);
                }
            })
        });
        for (let index = 0; index < 5; index++) {
            DB.transaction((tx) => {
                tx.executeSql("SELECT * FROM settings where `key` = ?", ['num' + (index + 1)], (tx, res) => {
                    if (res.rows.length > 0) {
                        var num= {};
                        num['num' + (index + 1)] = res.rows.item(0).value;
                        this.setState(num);
                    } else {
                        tx.executeSql("insert into settings (`key`, value) values (?, ?)", ['num' + (index + 1), ""]);
                        var num = {};
                        num['num' + (index + 1)] = "09";
                        this.setState(num);
                    }
                })
            });

        }
    }

    _savePhoneNumbers = () => {
        DB.transaction((tx) => {
            tx.executeSql("SELECT * FROM settings where `key` = ?", ["sosMessageText"], (tx, res) => {
                if (res.rows.length > 0) {
                    tx.executeSql("UPDATE settings SET value= ? where `id`= ?", [this.state["sosMessageText"], res.rows.item(0).id])
                    var num = {};
                    num["sosMessageText"] = this.state["sosMessageText"];
                    this.setState(num);
                } else {
                    tx.executeSql("insert into settings (`key`, value) values (?, ?)", ["sosMessageText", ""]);
                    var num = {};
                    num["sosMessageText"] = "09";
                    this.setState(num);
                }
            })
        });
        for (let index = 0; index < 5; index++) {
            DB.transaction((tx) => {
                tx.executeSql("SELECT * FROM settings where `key` = ?", ['num' + (index + 1)], (tx, res) => {
                    
                    if (res.rows.length > 0) {
                        tx.executeSql("UPDATE settings SET value= ? where `id`= ?", [this.state['num' + (index + 1)], res.rows.item(0).id])
                        var num = {};
                        num['num' + (index + 1)] = this.state['num' + (index + 1)];
                        this.setState(num);
                    } else {
                        tx.executeSql("insert into settings (`key`, value) values (?, ?)", ['num' + (index + 1), ""]);
                        var num = {};
                        num['num' + (index + 1)] = "09";
                        this.setState(num);
                    }
                })
            })
        }
        var text = "#meg-" + this.state.sosMessageText;
        for (let index = 0; index < 5; index++) {
            if (this.state['num' + (index + 1)]) {
                text += '#num-' + this.state['num' + (index + 1)]
            }  
        }

        console.log(text);
        this._sendSMS(text);
    }

    MS_PHONE_NUM = (num = null, del = false) => {
        let method = 'MS_PHONE_NUM';
        let data = null;
        if (del) {
            DB.transaction((tx) => {
                tx.executeSql("DELETE FROM settings WHERE key = ?", [method])
                this.setState({
                    phoneNumber: false,
                    text: ""
                })
            });
        }
        if (num) {
            return DB.transaction((tx) => {
                tx.executeSql("insert into settings (`key`, value) values (?, ?)", [method, num]);
                this.setState({
                    phoneNumber: num,
                    text: ""
                })
            });
        } else {
            DB.transaction((tx) => {
                tx.executeSql("SELECT * FROM settings where `key` = ?", [method], (tx, res) => {
                // tx.executeSql("SELECT * FROM settings", [], (tx, res) => {
                //     for (let index = 0; index < res.rows.length; index++) {
                //         console.log(res.rows.item(index));
                                                
                //     }
                    if (res.rows.length > 0) {
                        this.setState({
                            phoneNumber: res.rows.item(0).value,
                            text: ""
                        })
                    }
                })
            });
        }
    }

    _savenum = (method) => {
        if (method) {
            this.MS_PHONE_NUM(null, true);
            return
        }

        var text = this.state.text;
        if (!text) {
            Alert.alert(
                'خطا',
                'شماره تلفن وارد نشده است',
                [
                    { text: 'باشه!' },
                ],
                { cancelable: false }
            )
            return
        } else if (text.length < 11) {
            Alert.alert(
                'خطا',
                'شماره تلفن وارد شده اشتباه است',
                [
                    { text: 'باشه!' },
                ],
                { cancelable: false }
            )
            return
        }
        
        this.MS_PHONE_NUM(text);
    }
 
    render() {
        return (
            <View style={st.container}>
                <View elevation={5} style={st.header}>
                    <Text style={st.headerText} >
                        تماس اضطراری
                    </Text>
                </View>
                {this.state.phoneNumber ? 
                    <View style={{flex: 1}}> 
                        <View elevation={4} style={st.phoneNumber}>
                            <Text style={st.acText} >شماره دستگاه: <Text style={{ color: 'gray', fontFamily: 'Yekan', fontSize: 15 }} >{this.state.phoneNumber}</Text></Text>
                            <TouchableHighlight onPress={() => this._savenum('del')} style={st.delbutton} >
                                <Text style={st.acText} >حذف</Text>
                            </TouchableHighlight>
                        </View>
                        <ScrollView contentContainerStyle={st.acBody} >

                            <View style={st.message}>
                                <TextInput
                                    style={[st.acinput, {width: (width - 60)}]}
                                    underlineColorAndroid="transparent"
                                    placeholder="متن پیامک را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    multiline={true}
                                    numberOfLines={5}
                                    defaultValue={this.state.sosMessageText ? this.state.sosMessageText : ""}
                                    onChangeText={(sosMessageText) => this.setState({ sosMessageText })}
                                />
                            </View>

                            <View style={st.message}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره 1:</Text>
                                <TextInput
                                    style={st.acinput}
                                    underlineColorAndroid="transparent"
                                    placeholder="شماره تلفن را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    caretHidden={true}
                                    defaultValue={this.state.num1 ? this.state.num1 : "09"}
                                    onChangeText={(num1) => this.setState({ num1 })}
                                />
                            </View>
                            <View style={st.message}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره 2:</Text>
                                <TextInput
                                    style={st.acinput}
                                    underlineColorAndroid="transparent"
                                    placeholder="شماره تلفن را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    caretHidden={true}
                                    defaultValue={this.state.num2 ? this.state.num2 : "09"}
                                    onChangeText={(num2) => this.setState({ num2 })}
                                />
                            </View>
                            <View style={st.message}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره 3:</Text>
                                <TextInput
                                    style={st.acinput}
                                    underlineColorAndroid="transparent"
                                    placeholder="شماره تلفن را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    caretHidden={true}
                                    defaultValue={this.state.num3 ? this.state.num3 : "09"}
                                    onChangeText={(num3) => this.setState({ num3 })}
                                />
                            </View>
                            <View style={st.message}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره 4:</Text>
                                <TextInput
                                    style={st.acinput}
                                    underlineColorAndroid="transparent"
                                    placeholder="شماره تلفن را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    caretHidden={true}
                                    defaultValue={this.state.num4 ? this.state.num4 : "09"}
                                    onChangeText={(num4) => this.setState({ num4 })}
                                />
                            </View>
                            <View style={[st.message, {marginBottom: 20}]}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره 5:</Text>
                                <TextInput
                                    style={st.acinput}
                                    underlineColorAndroid="transparent"
                                    placeholder="شماره تلفن را وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    caretHidden={true}
                                    defaultValue={this.state.num5 ? this.state.num5 : "09"}
                                    onChangeText={(num5) => this.setState({ num5 })}
                                />
                            </View>

                        </ScrollView>
                        <TouchableHighlight onPress={() => this._savePhoneNumbers()} style={{ backgroundColor: '#16a085' }} >
                            <Text style={[st.deBodyText, { fontSize: 18, paddingVertical: 10, color: '#fff'}]} >ثبت</Text>
                        </TouchableHighlight>
                    </View>
                :
                    <View style={st.deBody} >
                        <TextInput
                            style={st.deinput}
                            underlineColorAndroid="transparent"
                            placeholder="شماره سیم‌کارت وارد شده در دستگاه را وارد کنید"
                            placeholderTextColor="#43a9ff88"
                            keyboardType="phone-pad"
                            maxLength={11}
                            caretHidden={true}
                            defaultValue="09"
                            onChangeText={(text) => this.setState({text})}
                        />
                        <TouchableHighlight onPress={() => this._savenum()} style={{ borderRadius: 5, backgroundColor: '#43a9ff'}} >
                            <Text style={st.deBodyText} >ثبت</Text> 
                        </TouchableHighlight>
                    </View>
                }
                

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
    deBody:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        alignContent: 'center',
        marginHorizontal: 40,
    },
    deBodyText:{
        fontFamily: 'Iransans',
        fontSize: 15,
        color: '#fff',
        textAlign: 'center',
        padding: 15,
    },
    deinput:{
        borderColor: '#43a9ff',
        borderWidth: 3,
        borderRadius: 5,
        marginBottom: 10
    },
    acBody:{
        flexGrow: 1,
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 20
    },
    acText:{
        fontFamily: 'Iransans',
        fontSize: 15,
        color: '#43a9ff'
    },
    phoneNumber:{
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 10,
        borderColor: '#43a9ff',
        borderBottomWidth: 1
    },
    delbutton: { 
        borderRadius: 5, 
        backgroundColor: '#fff',
        borderColor: '#43a9ff',
        borderWidth: 1,
        padding:5
    },
    acinput:{
        borderColor: '#f1c40f',
        borderWidth: 2,
        borderRadius: 5,
        marginVertical: 15,
        width: (width - 150),
        fontFamily: 'Iransans',
        marginHorizontal: 5
    },
    message:{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

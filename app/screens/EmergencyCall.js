import React, { Component } from 'react';
import { StyleSheet, Text, View, BackHandler, Dimensions, TouchableOpacity, TextInput, ImageBackground,Alert, Image, ScrollView, TouchableHighlight} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';
import Toast from '@remobile/react-native-toast'
import Icon from "react-native-vector-icons/Ionicons";
import DB from "./../model/DbConfig";
import SendSMS from 'react-native-sms'

const {width, height} = Dimensions.get('window');
const costomHeight = (width * 968) / 1080;

export default class EmergencyCall extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isEnabled: false,
            phoneNumber: false,
            text: "",
            textMessage: "",
            numbers: []
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
    
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + ' error: ' + error);
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
        var numbers = this.state.numbers;

        numbers.map((item, index) => {
            DB.transaction((tx) => {
                tx.executeSql("SELECT * FROM settings where `key` = ?", ['num' + (index + 1)], (tx, res) => {
                    
                    if (res.rows.length > 0) {
                        tx.executeSql("UPDATE settings SET value= ? where `id`= ?", [item.num, res.rows.item(0).id])
                        var num = {};
                        num['id'] = "num" + (index + 1);
                        num['num'] = res.rows.item(0).value;
                        numbers.push(num)
                        this.setState(numbers);
                    } else {
                        tx.executeSql("insert into settings (`key`, value) values (?, ?)", ['num' + (index + 1), ""]);
                        var num = {};
                        num['id'] = "num" + (index + 1);
                        num['num'] = "09";
                        numbers.push(num)
                        this.setState(numbers);
                    }
                })
            })
        })
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

        var numbers = this.state.numbers;

        numbers.map((item, index) => {
            DB.transaction((tx) => {
                tx.executeSql("SELECT * FROM settings where `key` = ?", [item.id], (tx, res) => {
                    
                    if (res.rows.length > 0) {
                        tx.executeSql("UPDATE settings SET value= ? where `id`= ?", [item.num, res.rows.item(0).id])
                        var num = {};
                        num[item.id] = item.num
                        this.setState(num);
                    } else {
                        tx.executeSql("insert into settings (`key`, value) values (?, ?)", [item.id, ""]);
                        var num = {};
                        num['id'] = "num" + (index + 1);
                        num['num'] = "09";
                        numbers.push(num)
                        this.setState(numbers);
                    }
                })
            })
        })

        var text = "#meg-" + this.state.sosMessageText;
        for (let index = 0; index < 5; index++) {
            if (this.state['num' + (index + 1)]) {
                text += '#num-' + this.state['num' + (index + 1)]
            }  
        }

        console.log(text);
        this._sendSMS(text);
    }

    _addnew = () => {
        var numbers = this.state.numbers;
        var $this = {
            id: "num" + numbers.length,
            num: "09",
        }
        numbers.push($this);
        this.setState({numbers});
        console.log(this.state.numbers);
        
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
                <ImageBackground style={{width: width, height: costomHeight}} source={require("./../../images/bg.png")}>
                    <Text style={st.headerText} >
                        تماس اضطراری
                    </Text>
                    <View style={st.topBar} >
                        <Text style={{fontFamily: "Iransans"}}>شماره دستگاه:</Text>
                        
                        {this.state.phoneNumber ? 
                            <Text style={{fontFamily: "Iransans", flex: 1, marginHorizontal: 10}}>{this.state.phoneNumber}</Text>
                        :
                            <TextInput
                                style={{fontFamily: "Iransans", flex: 1, marginHorizontal: 10}}
                                underlineColorAndroid="#2ecc7188"
                                placeholder="وارد کنید"
                                placeholderTextColor="#2ecc7188"
                                keyboardType="phone-pad"
                                maxLength={11}
                                // caretHidden={true}
                                defaultValue="09"
                                onChangeText={(text) => this.setState({text})}
                            />
                        }
                        {this.state.phoneNumber ? 
                            <TouchableHighlight onPress={() => this._savenum('del')} style={{ borderRadius: 5, backgroundColor: 'red', marginVertical: 5}} >
                                <Text style={{fontFamily: "Iransans", color: "#fff", paddingHorizontal: 15, paddingVertical: 7}} >حذف</Text> 
                            </TouchableHighlight>
                        :
                            <TouchableHighlight onPress={() => this._savenum()} style={{ borderRadius: 5, backgroundColor: '#2ecc71'}} >
                                <Text style={{fontFamily: "Iransans", color: "#fff", paddingHorizontal: 15, paddingVertical: 7}} >ثبت</Text> 
                            </TouchableHighlight>
                        }
                        
                    </View>
                </ImageBackground>
        
                <ScrollView 
                    contentContainerStyle={st.body} 
                    keyboardShouldPersistTaps="handled" 
                    style={{flex: 1,marginTop: -1 * (costomHeight / 2)}}>

                {this.state.phoneNumber ? 
                    <View style={st.panel}>
                        <View style={st.message}>
                            <Text style={{fontFamily: "Iransans", color: "gray", fontSize: 13}} >متن پیامک را وارد کنید</Text> 
                            <TextInput
                                style={[{fontFamily: "Iransans", textAlign: "right"}, {flex: 1}]}
                                underlineColorAndroid="#c0c0c0"
                                placeholder="وارد کنید ..."
                                placeholderTextColor="lightgray"
                                multiline={true}
                                numberOfLines={5}
                                defaultValue={this.state.sosMessageText ? this.state.sosMessageText : ""}
                                onChangeText={(sosMessageText) => this.setState({ sosMessageText })}
                            />
                        </View>
                        <View style={st.bottomTop}>
                            <Text style={[{color: '#808080', fontSize: 12, fontFamily: "Iransans"}]} >برای افزودن گیرنده روی دکمه روبرو تاچ کنید</Text>
                            <TouchableOpacity  onPress={() => this._addnew()} style={[st.navigator, st.addRow]} >
                                <Icon
                                    name='ios-add-circle'
                                    color='#31ca77'
                                    size={35}
                                />
                            </TouchableOpacity>
                        </View>
                        {this.state.numbers.map((item, index) => {
                            return (<View key={index} style={[{flexDirection: "row", alignItems: "center", paddingHorizontal: 10}]}>
                                <Text style={[st.acText, { fontFamily: 'Yekan' }]} >شماره {index + 1}:</Text>
                                <TextInput
                                    style={[{fontFamily: "Iransans", textAlign: "left"}, {flex: 1}]}
                                    underlineColorAndroid="#43a9ff88"
                                    placeholder="وارد کنید"
                                    placeholderTextColor="#43a9ff88"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    defaultValue={this.state.numbers[index].num}
                                    onChangeText={(text) => {
                                        var numbers = this.state.numbers
                                        numbers[index].num = text
                                        this.setState({ numbers })
                                    }}
                                />
                            </View>)
                        })}
                    </View>
                :
                    <View style={{justifyContent: "center", alignItems: "center", marginTop: height / 3}}>
                        <Icon name="ios-information-circle" size={35} color={"gray"}/>
                        <Text style={{fontFamily: "Iransans", color: "gray", fontSize: 17, paddingHorizontal: 15, paddingVertical: 7}} >شماره دستگاه را وارد نمایید</Text> 
                    </View>
                }
                </ScrollView>
                
                <TouchableOpacity onPress={() => this._savePhoneNumbers()} style={[st.exit, {backgroundColor: "#16a085"}]}>
                    <Text style={[st.itemText, {color: '#fff', paddingVertical: 7, fontSize: 18}]} >ثبت</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const st = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    panel: {
        marginHorizontal: 15,
        backgroundColor: "#fff",
        elevation: 4,
        borderRadius: 5
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
        color: '#fff',
        textAlign: 'center',
        paddingTop: 20
    },
    body:{
        flexGrow: 1,
        // justifyContent: 'space-around',
        // position: 'absolute',
    },

    itemText:{
        fontFamily: 'Iransans',
        fontSize: 15,
        color: 'gray',
        textAlign: 'center'
    },
    exit:{
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center'
    },
    topBar: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center' ,
        elevation: 4,
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 5
    },
    message:{
        paddingHorizontal: 10,
        marginVertical: 10
    },
    bottomTop:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10
    },
    navigator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

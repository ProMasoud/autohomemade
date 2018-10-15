import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Switch,
    TextInput,
    TouchableHighlight
} from "react-native";
import BluetoothSerial from "react-native-bluetooth-serial";
import { Buffer } from "buffer";
const iconv = require("iconv-lite");
import DB from "./../model/DbConfig";
global.Buffer = Buffer;
import { gregorian_to_jalali } from "./../config/functions";

export default class GeneralSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            setting: {
                ring: false,
                helpLight: false,
                waterOnOff: false,
                setdate: false
            },
            hour: "00",
            min: "00"
        };
    }

    componentDidMount() {
        var d = new Date();
        this.setState({
            hour: d.getHours(),
            min: d.getMinutes()
        });
        var db = DB.transaction(tx => {
            tx.executeSql("SELECT * FROM settings", [], (tx, res) => {
                for (let index = 0; index < res.rows.length; index++) {
                    console.log(res.rows.item(index));
                }
            });
        });
        DB.transaction(tx => {
            for (var key in this.state.setting) {
                if (this.state.setting.hasOwnProperty(key)) {
                    // console.log(key);
                    let keyy = key;
                    tx.executeSql(
                        "SELECT * FROM settings where `key` = ?",
                        [keyy],
                        (tx, res) => {
                            // console.log(res.rows.item(0));
                            var item = res.rows.item(0);
                            var num = this.state.setting;
                            num[item.key] = item.value;
                            this.setState({ setting: num });
                        }
                    );
                }
            }
        });
    }

    writePackets(message, packetSize = 64) {
        const toWrite = iconv.encode(message, "cp852");
        const writePromises = [];
        const packetCount = Math.ceil(toWrite.length / packetSize);

        for (var i = 0; i < packetCount; i++) {
            const packet = new Buffer(packetSize);
            packet.fill(" ");
            toWrite.copy(packet, 0, i * packetSize, (i + 1) * packetSize);
            writePromises.push(BluetoothSerial.write(packet));
        }

        Promise.all(writePromises).then(result => {
            alert("باموفقیت ثبت شد.");
            this.props.navigation.navigate("Home");
        });
    }

    _savePhoneNumbers = () => {
        this.writeToDB();
        var text = "0";
        var d = new Date();
        text += gregorian_to_jalali(
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate()
        )[0];
        text += (
            "0" +
            gregorian_to_jalali(
                d.getFullYear(),
                d.getMonth() + 1,
                d.getDate()
            )[1]
        ).slice(-2);
        text += (
            "0" +
            gregorian_to_jalali(
                d.getFullYear(),
                d.getMonth() + 1,
                d.getDate()
            )[2]
        ).slice(-2);
        text += ("0" + d.getHours()).slice(-2);
        text += ("0" + d.getMinutes()).slice(-2);
        text += this.state.setting["ring"];
        text += this.state.setting["helpLight"];
        text += this.state.setting["waterOnOff"];

        console.log(text, text.length);

        this.writePackets(text, text.length);
    };

    writeToDB = () => {
        DB.transaction(tx => {
            for (var key in this.state.setting) {
                if (this.state.setting.hasOwnProperty(key)) {
                    // console.log(key);
                    let keyy = key;
                    tx.executeSql(
                        "SELECT * FROM settings where `key` = ?",
                        [keyy],
                        (tx, res) => {
                            // console.log([keyy, res.rows.item(0)]);
                            if (res.rows.length > 0) {
                                tx.executeSql(
                                    "UPDATE settings SET value= ? where `id`= ?",
                                    [
                                        this.state.setting[keyy],
                                        res.rows.item(0).id
                                    ]
                                );
                                var num = {};
                                num[keyy] = this.state.setting[keyy];
                                this.setState(num);
                            } else {
                                tx.executeSql(
                                    "insert into settings (`key`, value) values (?, ?)",
                                    [keyy, this.state.setting[keyy]]
                                );
                            }
                        }
                    );
                }
            }
        });
    };

    render() {
        return (
            <View style={st.container}>
                <View elevation={5} style={st.header}>
                    <Text style={st.headerText}>تنضیمات کلی</Text>
                </View>
                <View style={st.body}>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Switch
                            onTintColor="#43a9ff"
                            thumbTintColor="#43a9ff"
                            onValueChange={ring => {
                                var setting = this.state;
                                setting.setting["ring"] = ring;
                                this.setState(setting);
                            }}
                            value={
                                this.state.setting.ring == "1.0" ? true : false
                            }
                        />
                        <Text style={st.settingText}>
                            {" "}
                            - زنگ خوردن خود دستگاه
                        </Text>
                    </View>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Switch
                            onTintColor="#43a9ff"
                            thumbTintColor="#43a9ff"
                            onValueChange={helpLight => {
                                var setting = this.state.setting;
                                setting["helpLight"] = helpLight;
                                this.setState(setting);
                            }}
                            value={
                                this.state.setting.helpLight > 0 ? true : false
                            }
                        />
                        <Text style={st.settingText}>
                            {" "}
                            - چراغ های مصرف دارو
                        </Text>
                    </View>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Switch
                            onTintColor="#43a9ff"
                            thumbTintColor="#43a9ff"
                            onValueChange={waterOnOff => {
                                var setting = this.state.setting;
                                setting["waterOnOff"] = waterOnOff;
                                this.setState(setting);
                            }}
                            value={
                                this.state.setting.waterOnOff > 0 ? true : false
                            }
                        />
                        <Text style={st.settingText}> - قطع و وصل آب</Text>
                    </View>
                    <Text style={st.settingText}> تنظیم ساعت</Text>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10
                        }}
                    >
                        <Text style={st.settingText}>دستی - </Text>
                        <Switch
                            onTintColor="#43a9ff"
                            thumbTintColor="#43a9ff"
                            onValueChange={setdate => {
                                var setting = this.state.setting;
                                setting["setdate"] = setdate;
                                this.setState(setting);
                            }}
                            value={
                                this.state.setting.setdate > 0 ? true : false
                            }
                        />
                        <Text style={st.settingText}> - خودکار</Text>
                    </View>

                    {(this.state.setting.setdate > 0 ? (
                        true
                    ) : (
                        false
                    )) ? (
                        <View style={st.time}>
                            <Text style={st.settingText}>ساعت</Text>
                            <TextInput
                                style={st.deinput}
                                placeholderTextColor="#43a9ff88"
                                keyboardType="numeric"
                                maxLength={2}
                                defaultValue={this.state.min.toString()}
                                onChangeText={min => {
                                    if (min > 60) {
                                        var setting = this.state;
                                        setting["min"] = "00";
                                        this.setState(setting);
                                    } else {
                                        var setting = this.state;
                                        setting["min"] = min;
                                        this.setState(setting);
                                    }
                                }}
                            />
                            <Text style={st.settingText}>:</Text>
                            <TextInput
                                style={st.deinput}
                                placeholderTextColor="#43a9ff88"
                                keyboardType="numeric"
                                maxLength={2}
                                defaultValue={this.state.hour.toString()}
                                onChangeText={hour => {
                                    if (hour > 24) {
                                        var setting = this.state;
                                        setting["hour"] = "00";
                                        this.setState(setting);
                                    } else {
                                        var setting = this.state;
                                        setting["hour"] = hour;
                                        this.setState(setting);
                                    }
                                }}
                            />
                        </View>
                    ) : (
                        <View style={st.time}>
                            <Text style={st.settingText}>ساعت</Text>
                            <TextInput
                                style={st.deinput}
                                placeholderTextColor="#43a9ff88"
                                keyboardType="numeric"
                                maxLength={2}
                                editable={false}
                                defaultValue={this.state.min.toString()}
                                onChangeText={min => {
                                    var setting = this.state.time;
                                    setting["min"] = min;
                                    this.setState(setting);
                                }}
                            />
                            <Text style={st.settingText}>:</Text>
                            <TextInput
                                style={st.deinput}
                                placeholderTextColor="#43a9ff88"
                                keyboardType="numeric"
                                maxLength={2}
                                editable={false}
                                defaultValue={this.state.hour.toString()}
                                onChangeText={hour => {
                                    var setting = this.state.time;
                                    setting["hour"] = hour;
                                    this.setState(setting);
                                }}
                            />
                        </View>
                    )}
                </View>
                <TouchableHighlight
                    onPress={() => this._savePhoneNumbers()}
                    style={{ backgroundColor: "#16a085" }}
                >
                    <Text
                        style={[
                            st.deBodyText,
                            { fontSize: 18, paddingVertical: 10, color: "#fff" }
                        ]}
                    >
                        ثبت
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const st = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between"
    },
    header: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#43a9ff",
        height: 56
    },
    headerText: {
        fontFamily: "Iransans",
        fontSize: 25,
        color: "#fff"
    },
    settingText: {
        fontFamily: "Iransans",
        fontSize: 18,
        color: "gray"
    },
    body: {
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 20
    },
    time: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderColor: "#43a9ff",
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 50
    },
    deBodyText: {
        fontFamily: "Iransans",
        fontSize: 15,
        color: "#fff",
        textAlign: "center",
        padding: 15
    }
});

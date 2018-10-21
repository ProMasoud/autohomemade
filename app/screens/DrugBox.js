import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    ScrollView,
    BackHandler
} from "react-native";
import Modal from "react-native-modal";
const { width } = Dimensions.get("window");
const costomHeight = (width * 968) / 1080;
import RadioForm from "react-native-simple-radio-button";
import BluetoothSerial from "react-native-bluetooth-serial";
import { Buffer } from "buffer";
global.Buffer = Buffer;
const iconv = require("iconv-lite");
import DB from "./../model/DbConfig";

const radio_props = [{ label: "بله", value: 1 }, { label: "خیر", value: 0 }];

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEnabled: false,
            discovering: false,
            devices: [],
            unpairedDevices: [],
            connected: true,
            section: 0,
            popup: false,
            eat: 0,
            box: [],
            boxnum: 0,
            time1: "",
            time2: "",
            time3: "",
            time4: "",
            water: 1
        };

        this.handleBackPress = this.handleBackPress.bind(this);
    }

    popup = num => {
        DB.transaction(tx => {
            tx.executeSql(
                "SELECT * FROM `boxes` WHERE box = ?",
                [num],
                (err, res) => {
                    if (err.message) {
                        alert(err.message);
                        return;
                    }
                    let box = res.rows.item(0);
                    this.setState({
                        boxnum: num,
                        time1: box.time1,
                        time2: box.time2,
                        time3: box.time3,
                        time4: box.time4,
                        water: box.water,
                        eat: box.eat,
                        popup: true
                    });
                }
            );
        });
    };

    selecteat = num => {
        this.setState({
            eat: num
        });
    };

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);

        let boxes = [];
        DB.transaction(tx => {
            tx.executeSql("SELECT * FROM boxes", [], (tx, res) => {
                if (res.rows.length < 12) {
                    if (res.rows.length == 0) {
                        for (let index = 0; index < 12; index++) {
                            tx.executeSql(
                                "insert into boxes (`box`) values (?)",
                                [index + 1]
                            );
                        }
                    }
                } else {
                    DB.transaction(tx => {
                        tx.executeSql("SELECT * FROM boxes", [], (tx, res) => {
                            for (
                                let index = 0;
                                index < res.rows.length;
                                index++
                            ) {
                                boxes.push(res.rows.item(index));
                                this.setState({ box: boxes });
                            }
                        });
                    });
                }
            });
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            "hardwareBackPress",
            this.handleBackPress
        );
    }

    handleBackPress = e => {
        console.log(e);

        if (this.state.popup) {
            this.setState({ popup: false });
        } else {
            this.props.navigation.goBack();
        }
        return true;
    };

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

        Promise.all(writePromises).then(result => {});
    }

    sendData = () => {
        let text = "1";
        text += ("0" + this.state.boxnum).slice(-2);
        text += parseInt(this.state.eat).toString();
        text += this.state.water ? "1" : "0";
        text += this.state.time1 ? ("0" + this.state.time1).slice(-2) : "99";
        text += this.state.time2 ? ("0" + this.state.time2).slice(-2) : "99";
        text += this.state.time3 ? ("0" + this.state.time3).slice(-2) : "99";
        text += this.state.time4 ? ("0" + this.state.time4).slice(-2) : "99";

        DB.transaction(tx => {
            tx.executeSql(
                "UPDATE `boxes` SET time1 = ?, time2 = ?, time3 = ?, time4 = ?, water = ?, eat = ? WHERE box = ?",
                [
                    this.state.time1,
                    this.state.time2,
                    this.state.time3,
                    this.state.time4,
                    this.state.water,
                    this.state.eat,
                    this.state.boxnum
                ],
                (err, res) => {
                    if (err.message) {
                        alert(err.message);
                        return;
                    }
                }
            );
        });
        text += "   ";

        this.writePackets(text, text.length);
        this.setState({ popup: false });
    };

    render() {
        return (
            <View style={st.container}>
                <ImageBackground
                    style={{ width: width, height: costomHeight }}
                    source={require("./../../images/bg.png")}
                >
                    <Text style={st.headerText}>جعبه دارویی</Text>
                </ImageBackground>

                <ScrollView
                    contentContainerStyle={st.body}
                    style={{ flex: 1, marginTop: -1 * (costomHeight / 2) }}
                >
                    <View style={st.feature}>
                        <TouchableOpacity
                            onPress={() => this.popup(1)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 1
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(2)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 2
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(3)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 3
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={st.feature}>
                        <TouchableOpacity
                            onPress={() => this.popup(4)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 4
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(5)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 5
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(6)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 6
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={st.feature}>
                        <TouchableOpacity
                            onPress={() => this.popup(7)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 7
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(8)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 8
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(9)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 9
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={st.feature}>
                        <TouchableOpacity
                            onPress={() => this.popup(10)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 10
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(11)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 11
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.popup(12)}
                            style={st.box}
                        >
                            <Text
                                style={[
                                    st.itemText,
                                    { color: "#fff", fontFamily: "Yekan" }
                                ]}
                            >
                                جعبه 12
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    onPress={() => BackHandler.exitApp()}
                    style={st.exit}
                >
                    <Text
                        style={[
                            st.itemText,
                            { color: "#fff", paddingVertical: 7, fontSize: 18 }
                        ]}
                    >
                        خروج
                    </Text>
                </TouchableOpacity>
                <Modal
                    isVisible={this.state.popup}
                    onBackdropPress={() => this.setState({ popup: false })}
                >
                    <ScrollView keyboardShouldPersistTaps={"handled"}>
                        <View style={st.popupTitle}>
                            <Text
                                style={[
                                    st.itemText,
                                    {
                                        color: "#f1c40f",
                                        flex: 1,
                                        textAlign: "left"
                                    }
                                ]}
                            >
                                جعبه شماره {this.state.boxnum}
                            </Text>
                        </View>
                        <View
                            style={[
                                st.feature,
                                { justifyContent: "space-between" }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => this.selecteat(0)}
                                style={[
                                    st.box,
                                    {
                                        height: 80,
                                        width: 80,
                                        marginHorizontal: 5,
                                        elevation: 5
                                    },
                                    this.state.eat == 0
                                        ? {}
                                        : { backgroundColor: "#fff" }
                                ]}
                            >
                                <Text
                                    style={[
                                        st.itemText,
                                        { color: "gray", fontFamily: "Yekan" }
                                    ]}
                                >
                                    قبل از غذا
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.selecteat(1)}
                                style={[
                                    st.box,
                                    {
                                        height: 80,
                                        width: 80,
                                        marginHorizontal: 5,
                                        elevation: 5
                                    },
                                    this.state.eat == 1
                                        ? {}
                                        : { backgroundColor: "#fff" }
                                ]}
                            >
                                <Text
                                    style={[
                                        st.itemText,
                                        { color: "gray", fontFamily: "Yekan" }
                                    ]}
                                >
                                    حین غذا{" "}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.selecteat(2)}
                                style={[
                                    st.box,
                                    {
                                        height: 80,
                                        width: 80,
                                        marginHorizontal: 5,
                                        elevation: 5
                                    },
                                    this.state.eat == 2
                                        ? {}
                                        : { backgroundColor: "#fff" }
                                ]}
                            >
                                <Text
                                    style={[
                                        st.itemText,
                                        { color: "gray", fontFamily: "Yekan" }
                                    ]}
                                >
                                    بعداز غذا
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text
                            style={{
                                fontFamily: "Iransans",
                                fontSize: 15,
                                color: "#006389"
                            }}
                        >
                            ساعت های مصرف دارو را وارد کنید
                        </Text>
                        <View style={st.times}>
                            <TextInput
                                underlineColorAndroid="#f1c40f"
                                style={st.textinput}
                                keyboardType={"numeric"}
                                maxLength={2}
                                defaultValue={this.state.time1.toString()}
                                placeholder="09"
                                onChangeText={text => {
                                    if (text > 23) text = 23;
                                    this.setState({ time1: text });
                                }}
                            />
                            <TextInput
                                underlineColorAndroid="#f1c40f"
                                style={st.textinput}
                                keyboardType={"numeric"}
                                maxLength={2}
                                defaultValue={this.state.time2.toString()}
                                placeholder="12"
                                onChangeText={text => {
                                    if (text > 23) text = 23;
                                    this.setState({ time2: text });
                                }}
                            />
                            <TextInput
                                underlineColorAndroid="#f1c40f"
                                style={st.textinput}
                                keyboardType={"numeric"}
                                maxLength={2}
                                defaultValue={this.state.time3.toString()}
                                placeholder="16"
                                onChangeText={text => {
                                    if (text > 23) text = 23;
                                    this.setState({ time3: text });
                                }}
                            />
                            <TextInput
                                underlineColorAndroid="#f1c40f"
                                style={st.textinput}
                                keyboardType={"numeric"}
                                maxLength={2}
                                defaultValue={this.state.time4.toString()}
                                placeholder="23"
                                onChangeText={text => {
                                    if (text > 23) text = 23;
                                    this.setState({ time4: text });
                                }}
                            />
                        </View>
                        <View style={st.water}>
                            <Text
                                style={[
                                    st.itemText,
                                    {
                                        color: "#006389",
                                        fontFamily: "Yekan",
                                        flex: 1,
                                        alignSelf: "center"
                                    }
                                ]}
                            >
                                آیا دارو با آب مصرف شود؟
                            </Text>
                            <RadioForm
                                radio_props={radio_props}
                                initial={0}
                                animation={true}
                                buttonSize={10}
                                buttonOuterSize={20}
                                labelStyle={{
                                    fontFamily: "Iransans",
                                    color: "#006389"
                                }}
                                formHorizontal={true}
                                labelHorizontal={true}
                                onPress={value => {
                                    this.setState({ water: value });
                                }}
                            />
                        </View>
                        <View style={st.buttons}>
                            <TouchableOpacity
                                onPress={() => this.sendData()}
                                style={st.button}
                            >
                                <Text
                                    style={[
                                        st.itemText,
                                        {
                                            color: "#006389",
                                            fontFamily: "Yekan"
                                        }
                                    ]}
                                >
                                    تایید اطلاعات
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    this.setState({ popup: !this.state.popup })
                                }
                                style={st.button}
                            >
                                <Text
                                    style={[
                                        st.itemText,
                                        {
                                            color: "#006389",
                                            fontFamily: "Yekan"
                                        }
                                    ]}
                                >
                                    بستن صفحه
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        );
    }
}

const st = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e3f1f8"
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
        color: "#fff",
        textAlign: "center",
        paddingTop: costomHeight / 4
    },
    body: {
        flexGrow: 1
        // justifyContent: "space-around"
        // position: 'absolute',
    },
    itemText: {
        fontFamily: "Iransans",
        fontSize: 15,
        color: "gray",
        textAlign: "center"
    },
    exit: {
        backgroundColor: "#e74c3c",
        justifyContent: "center",
        alignItems: "center"
    },
    fixedFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ddd"
    },
    name: {
        height: 60,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
    feature: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginVertical: 20
    },
    box: {
        backgroundColor: "#1abc9c",
        height: 100,
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
    explanation: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        padding: 5,
        borderRadius: 5
    },
    popupTitle: {
        backgroundColor: "#fbf0c3",
        flexDirection: "row",
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    water: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10
    },
    button: {
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 10
    },
    times: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: 20
    },
    textinput: {
        fontFamily: "Yekan",
        width: 50,
        textAlign: "center",
        fontSize: 25
    }
});

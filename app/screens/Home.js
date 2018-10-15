import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    BackHandler,
    Dimensions,
    TouchableOpacity,
    TouchableHighlight,
    ImageBackground,
    Image,
    ScrollView,
    ActivityIndicator
} from "react-native";
import BluetoothSerial from "react-native-bluetooth-serial";
import Toast from "@remobile/react-native-toast";
import Icon from "react-native-vector-icons/FontAwesome";
import { Buffer } from "buffer";
global.Buffer = Buffer;
const iconv = require("iconv-lite");
import Overlay from "react-native-modal-overlay";
import SplashScreen from "react-native-splash-screen";
import DB from "./../model/DbConfig";
const { width } = Dimensions.get("window");
const costomHeight = (width * 968) / 1080;

const Button = ({ title, onPress, style, textStyle }) => (
    <TouchableOpacity style={[st.button, style]} onPress={onPress}>
        <Text style={[st.buttonText, textStyle]}>{title.toUpperCase()}</Text>
    </TouchableOpacity>
);

const DeviceList = ({
    devices,
    connectedId,
    showConnectedIcon = false,
    onDevicePress
}) => (
    <ScrollView>
        <View style={st.listContainer}>
            {devices.map((device, i) => {
                return (
                    <TouchableHighlight
                        underlayColor="#DDDDDD"
                        key={`${device.id}_${i}`}
                        style={st.listItem}
                        onPress={() => onDevicePress(device)}
                    >
                        <View style={{ flexDirection: "row" }}>
                            {showConnectedIcon ? (
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        opacity: 0.4
                                    }}
                                >
                                    {connectedId === device.id ? (
                                        <Icon
                                            name="check"
                                            size={30}
                                            color="#900"
                                        />
                                    ) : null}
                                </View>
                            ) : null}
                            <View
                                style={{
                                    justifyContent: "space-between",
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                            >
                                <Text style={{ fontWeight: "bold" }}>
                                    {device.name}
                                </Text>
                                <Text>{`<${device.id}>`}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                );
            })}
        </View>
    </ScrollView>
);

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEnabled: false,
            discovering: false,
            devices: [],
            unpairedDevices: [],
            connected: false,
            section: 0
        };
    }

    /**
     * [android]
     * request enable of bluetooth from user
     */
    requestEnable() {
        BluetoothSerial.requestEnable()
            .then(res => {
                if (res) {
                    this.setState({ isEnabled: true });
                    SplashScreen.hide();
                    if (!this.state.connected) {
                        this.discoverUnpaired();
                    }
                } else {
                    BackHandler.exitApp();
                }
            })
            .catch(err => {
                Toast.showShortBottom(err.message);
                BackHandler.exitApp();
            });
    }

    /**
     * [android]
     * enable bluetooth on device
     */
    enable() {
        BluetoothSerial.enable()
            .then(res => {
                if (res) {
                    this.setState({ isEnabled: true });
                    SplashScreen.hide();
                    if (!this.state.connected) {
                        this.discoverUnpaired();
                    }
                } else {
                    BackHandler.exitApp();
                }
            })
            .catch(err => {
                Toast.showShortBottom(err.message);
                BackHandler.exitApp();
            });
    }

    /**
     * [android]
     * disable bluetooth on device
     */
    disable() {
        BluetoothSerial.disable()
            .then(res => this.setState({ isEnabled: false }))
            .catch(err => {
                Toast.showShortBottom(err.message);
                BackHandler.exitApp();
            });
    }

    /**
     * [android]
     * toggle bluetooth
     */
    toggleBluetooth(value) {
        if (value === true) {
            this.enable();
        } else {
            this.disable();
        }
    }

    /**
     * [android]
     * Discover unpaired devices, works only in android
     */
    discoverUnpaired() {
        if (this.state.discovering) {
            return false;
        } else {
            this.setState({ discovering: true });
            BluetoothSerial.discoverUnpairedDevices()
                .then(unpairedDevices => {
                    this.setState({ unpairedDevices, discovering: false });
                    console.log(unpairedDevices);
                    console.log(this.state.devices);
                })
                .catch(err => Toast.showShortBottom(err.message));
        }
    }

    /**
     * [android]
     * Discover unpaired devices, works only in android
     */
    cancelDiscovery() {
        if (this.state.discovering) {
            BluetoothSerial.cancelDiscovery()
                .then(() => {
                    this.setState({ discovering: false });
                })
                .catch(err => Toast.showShortBottom(err.message));
        }
    }

    /**
     * [android]
     * Pair device
     */
    pairDevice(device) {
        BluetoothSerial.pairDevice(device.id)
            .then(paired => {
                if (paired) {
                    Toast.showShortBottom(
                        `Device ${device.name} paired successfully`
                    );
                    const devices = this.state.devices;
                    devices.push(device);
                    this.setState({
                        devices,
                        unpairedDevices: this.state.unpairedDevices.filter(
                            d => d.id !== device.id
                        )
                    });
                } else {
                    Toast.showShortBottom(
                        `Device ${device.name} pairing failed`
                    );
                }
            })
            .catch(err => Toast.showShortBottom(err.message));
    }

    /**
     * Connect to bluetooth device by id
     * @param  {Object} device
     */
    connect(device) {
        this.setState({ connecting: true });
        BluetoothSerial.connect(device.id)
            .then(res => {
                Toast.showShortBottom(`Connected to device ${device.name}`);
                this.setState({ device, connected: true, connecting: false });
                this.writePackets("Masoud", 16);
            })
            .catch(err => Toast.showShortBottom(err.message));
    }

    /**
     * Disconnect from bluetooth device
     */
    disconnect() {
        BluetoothSerial.disconnect()
            .then(() => this.setState({ connected: false }))
            .catch(err => Toast.showShortBottom(err.message));
    }

    /**
     * Toggle connection when we have active device
     * @param  {Boolean} value
     */
    toggleConnect(value) {
        if (value === true && this.state.device) {
            this.connect(this.state.device);
        } else {
            this.disconnect();
        }
    }

    /**
     * Write message to device
     * @param  {String} message
     */
    write(message) {
        if (!this.state.connected) {
            Toast.showShortBottom("You must connect to device first");
        }

        BluetoothSerial.write(message)
            .then(res => {
                Toast.showShortBottom("Successfuly wrote to device");
                this.setState({ connected: true });
            })
            .catch(err => Toast.showShortBottom(err.message));
    }

    onDevicePress(device) {
        if (this.state.section === 0) {
            this.connect(device);
        } else {
            this.pairDevice(device);
        }
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

        Promise.all(writePromises).then(result => {});
    }

    componentDidMount() {
        var db = DB.transaction(tx => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS boxes (`id`	INTEGER PRIMARY KEY AUTOINCREMENT,`box`	INTEGER NOT NULL UNIQUE,`eat`	INTEGER DEFAULT 0,`water`	INTEGER DEFAULT 1,`time1`	INTEGER DEFAULT 99,`time2`	INTEGER DEFAULT 99,`time3`	INTEGER DEFAULT 99,`time4`	INTEGER DEFAULT 99);"
            );
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS `emergency_num` ( `number`	INTEGER NOT NULL, `id`	INTEGER PRIMARY KEY AUTOINCREMENT);"
            );
        });
        Promise.all([BluetoothSerial.isConnected()]).then(values => {
            const [isConnected] = values;
            if (isConnected) {
                this.setState({ connected: true });
            }
        });
    }

    componentWillMount() {
        Promise.all([BluetoothSerial.isEnabled(), BluetoothSerial.list()]).then(
            values => {
                const [isEnabled, devices] = values;
                this.setState({ isEnabled, devices });
                if (!isEnabled) {
                    this.requestEnable();
                } else {
                    SplashScreen.hide();
                    if (!this.state.connected) {
                        this.discoverUnpaired();
                    }
                }
            }
        );

        BluetoothSerial.on("bluetoothEnabled", () =>
            Toast.showShortBottom("Bluetooth enabled")
        );
        BluetoothSerial.on("bluetoothDisabled", () => {
            this.enable();
            Toast.showShortBottom("Bluetooth disabled");
        });
        BluetoothSerial.on("error", err =>
            console.log(`Error: ${err.message}`)
        );
        BluetoothSerial.on("connectionLost", () => {
            if (this.state.device) {
                Toast.showShortBottom(
                    `Connection to device ${
                        this.state.device.name
                    } has been lost`
                );
            }
            //   this.setState({ connected: false })
        });
    }

    render() {
        return (
            <View style={st.container}>
                <ImageBackground
                    style={{ width: width, height: costomHeight }}
                    source={require("./../../images/bg.png")}
                >
                    <Text style={st.headerText}>داروخانه خانگی</Text>
                </ImageBackground>

                <ScrollView
                    contentContainerStyle={st.body}
                    style={{ flex: 1, marginTop: -1 * (costomHeight / 2) }}
                >
                    <View style={st.itemRows}>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.navigation.navigate("DrugInfo")
                            }
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 25,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/info.png")}
                            />
                            <Text style={st.itemText}>اطلاعات دارویی</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {}}
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/helpicon.png")}
                            />
                            <Text style={st.itemText}>راهنمای استفاده</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={st.itemRows}>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.navigation.navigate("DrugBox")
                            }
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 54,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/cal.png")}
                            />
                            <Text style={st.itemText}>
                                مشاهده برنامه دارویی
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.navigation.navigate("EmergencyCall")
                            }
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/tele.png")}
                            />
                            <Text style={st.itemText}>تماس اضطراری</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={st.itemRows}>
                        <TouchableOpacity
                            onPress={() => {}}
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/aboutus.png")}
                            />
                            <Text style={st.itemText}>درباره ما</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.navigation.navigate(
                                    "GeneralSettings"
                                )
                            }
                            elevation={4}
                            style={st.item}
                        >
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 5
                                }}
                                source={require("./../../images/setting.png")}
                            />
                            <Text style={st.itemText}>تنظیمات</Text>
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
                <Overlay
                    visible={this.state.connected ? false : true}
                    animationType="zoomIn"
                    containerStyle={{
                        backgroundColor: "rgba(84, 160, 255, 0.40)"
                    }}
                    childrenWrapperStyle={{ backgroundColor: "#eee" }}
                    animationDuration={300}
                >
                    {this.state.discovering ? (
                        <View>
                            <Text style={[st.itemText, { paddingBottom: 10 }]}>
                                در حال جستجوی دستگاه ...
                            </Text>
                            <ActivityIndicator size="large" color="#54a0ff" />
                        </View>
                    ) : (
                        <DeviceList
                            connectedId={
                                this.state.device && this.state.device.id
                            }
                            devices={this.state.unpairedDevices.concat(
                                this.state.devices
                            )}
                            onDevicePress={device => this.onDevicePress(device)}
                        />
                    )}
                    {this.state.discovering ? (
                        <Button
                            title="لغو جستجو"
                            onPress={this.cancelDiscovery.bind(this)}
                        />
                    ) : (
                        <Button
                            title="تلاش دوباره"
                            onPress={this.discoverUnpaired.bind(this)}
                        />
                    )}
                </Overlay>
            </View>
        );
    }
}

const st = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
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
        flexGrow: 1,
        justifyContent: "space-around"
        // position: 'absolute',
    },
    itemRows: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 30
    },
    item: {
        justifyContent: "center",
        alignItems: "center",
        width: (width - 60) / 2,
        height: (width - 60) / 2,
        // borderColor: '#fff',
        // borderWidth: 3,
        backgroundColor: "#fff",
        elevation: 5
        // borderRadius: 10
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
    topBar: {
        height: 56,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 6,
        backgroundColor: "#7B1FA2"
    },
    heading: {
        fontWeight: "bold",
        fontSize: 16,
        alignSelf: "center",
        color: "#FFFFFF"
    },
    enableInfoWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    tab: {
        alignItems: "center",
        flex: 0.5,
        height: 56,
        justifyContent: "center",
        borderBottomWidth: 6,
        borderColor: "transparent"
    },
    connectionInfoWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 25
    },
    connectionInfo: {
        fontWeight: "bold",
        alignSelf: "center",
        fontSize: 18,
        marginVertical: 10,
        color: "#238923"
    },
    listContainer: {
        borderColor: "#ccc",
        borderTopWidth: 0.5
    },
    listItem: {
        flex: 1,
        height: 48,
        paddingHorizontal: 16,
        borderColor: "#ccc",
        borderBottomWidth: 0.5,
        justifyContent: "center"
    },
    fixedFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ddd"
    },
    button: {
        height: 36,
        margin: 5,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: "#7B1FA2",
        fontWeight: "bold",
        fontSize: 14
    },
    buttonRaised: {
        backgroundColor: "#7B1FA2",
        borderRadius: 2,
        elevation: 2
    }
});

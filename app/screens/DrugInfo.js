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
import Overlay from "react-native-modal-overlay";
const { width } = Dimensions.get("window");
const costomHeight = (width * 968) / 1080;

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEnabled: false,
            discovering: false,
            devices: [],
            unpairedDevices: [],
            connected: true,
            section: 0
        };
    }

    render() {
        return (
            <View style={st.container}>
                <ImageBackground
                    style={{ width: width, height: costomHeight }}
                    source={require("./../../images/bg.png")}
                >
                    <Text style={st.headerText}>اطلاعات دارویی</Text>
                </ImageBackground>

                <ScrollView
                    contentContainerStyle={st.body}
                    style={{ flex: 1, marginTop: -1 * (costomHeight / 2) }}
                >
                    <View style={st.name}>
                        <Text style={[st.itemText, { fontSize: 20 }]}>
                            استامینوفن
                        </Text>
                    </View>
                    <View style={st.feature}>
                        <View style={st.box}>
                            <Text style={[st.itemText, { color: "#fff" }]}>
                                بعد از غذا
                            </Text>
                        </View>
                        <View style={st.box}>
                            <Text style={[st.itemText, { color: "#fff" }]}>
                                شبانه
                            </Text>
                        </View>
                        <View style={st.box}>
                            <Text style={[st.itemText, { color: "#fff" }]}>
                                تزریق عضلانی
                            </Text>
                        </View>
                    </View>

                    <View style={st.explanation}>
                        <Text
                            style={[
                                st.itemText,
                                { textAlign: "left", fontSize: 13 }
                            ]}
                        >
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد تا با
                            نرم افزارها شناخت بیشتری را برای طراحان رایانه ای
                            علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی
                            ایجاد کرد. . لورم ایپسوم متن ساختگی با تولید سادگی
                            نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک
                            است. چاپگرها و متون بلکه روزنامه و مجله در ستون و
                            سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی
                            مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای
                            کاربردی می باشد. کتابهای زیادی در شصت و سه درصد
                            گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را
                            می طلبد تا با نرم افزارها شناخت بیشتری را برای
                            طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ
                            پیشرو در زبان فارسی ایجاد کرد. .
                        </Text>
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
        backgroundColor: "#935cb5",
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
    }
});

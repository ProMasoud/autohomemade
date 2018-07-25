// import React, { Component } from "react";
import SQLite from "react-native-sqlite-storage";

export default DB = SQLite.openDatabase({ name: 'nurse.db', createFromLocation: "~nurse.db" }, this.openCB, this.errorCB);


errorCB = (err) => {
    console.log("SQL Error: " + err);
}

openCB = () => {
    console.log("Database OPENED");
}
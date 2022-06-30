sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         * @param {typeof sap.m.MessagesBox} MessageBox
         */
    function (Controller,MessageBox) {
        "use strict";

        var Main = Controller.extend("logaligroup.employees.controller.App", {});

        function onInit() {
        }

        Main.prototype.onInit = onInit;

        return Main;
    }
);
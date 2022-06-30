sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
    function (Controller) {
        "use strict";

        var Main = Controller.extend("logaligroup.employees.controller.Base", {});

        function onInit() {
        }

        function toOrderDetails(oEvent) {
            var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrderDetails", {
                OrderID: orderID
            }
            );
        };

        Main.prototype.toOrderDetails = toOrderDetails;
        Main.prototype.onInit = onInit;

        return Main;
    }
);
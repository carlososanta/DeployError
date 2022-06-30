sap.ui.define([
    "logaligroup/employees/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Filter,FilterOperator) {
        "use strict";

        var Main = Controller.extend("logaligroup.employees.controller.MasterEmployee", {});

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
            
        }

        function onFilter() {
            var oJSON = this.getView().getModel("jsonCountries").getData();

            var filters = [];

            if (oJSON.EmployeeId !== "") {
                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSON.EmployeeId));
            }

            if (oJSON.CountryKey !== "") {
                filters.push(new Filter("Country", FilterOperator.EQ, oJSON.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
        };

        function onClearFilter() {
            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");
        };

        function showPostalCode(oEvent){
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        };

        function onHideShow(){
            var i18nBundle = this.getView().getModel("i18n").getResourceBundle();
            var columnCity = this.byId("columnCity");
            var btnHideShow = this.byId("btnHideShow");

            if (columnCity.getProperty("visible")) {
                columnCity.setVisible(false);
                btnHideShow.setText(i18nBundle.getText("btnShow"));
            } else {    
                columnCity.setVisible(true);
                btnHideShow.setText(i18nBundle.getText("btnHide"));
            }
        };

        function onShowDetail(oEvent){
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext();
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.FirstName);
        };

        function onShowCity(){
            var oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity",true);
            oJSONModelConfig.setProperty("/visibleBtnShowCity",false);
            oJSONModelConfig.setProperty("/visibleBtnHideCity",true);
        };

        function onHideCity(){
            var oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity",false);
            oJSONModelConfig.setProperty("/visibleBtnShowCity",true);
            oJSONModelConfig.setProperty("/visibleBtnHideCity",false);
        };

        function showOrder(oEvent) {
            var ordersTable = this.getView().byId("ordersTable");

            ordersTable.destroyItems();

            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("odataNorthwind");

            var objectContext = oContext.getObject();
            var orders = objectContext.Orders;

            var ordersItems = [];

            for (let i in orders ) {
                ordersItems.push(new sap.m.ColumnListItem({
                    cells : [
                        new sap.m.Label({ text: orders[i].OrderID}),
                        new sap.m.Label({ text: orders[i].Freight}),
                        new sap.m.Label({ text: orders[i].ShipAddress})
                    ]
                }));
            }

                var newTable = new sap.m.Table({
                    width : "auto",
                    columns: [
                        new sap.m.Column({header : new sap.m.Label({text : "{i18n>orderID}"})}),
                        new sap.m.Column({header : new sap.m.Label({text : "{i18n>freight}"})}),
                        new sap.m.Column({header : new sap.m.Label({text : "{i18n>shipAddress}"})})
                    ],
                    items: ordersItems
                }).addStyleClass("sapUiSmallMargin");
            ordersTable.addItem(newTable);

            var newTableJson = new sap.m.Table();
            newTableJson.setWidth("auto");
            newTableJson.addStyleClass("sapUiSmallMargin");

            var columnOrderID = new sap.m.Column();
            var labelOrderID = new sap.m.Label();
            labelOrderID.bindProperty("text","i18n>orderID");
            columnOrderID.setHeader(labelOrderID);
            newTableJson.addColumn(columnOrderID);

            var columnfreight = new sap.m.Column();
            var labelfreight = new sap.m.Label();
            labelfreight.bindProperty("text","i18n>freight");
            columnfreight.setHeader(labelfreight);
            newTableJson.addColumn(columnfreight);

            var columnshipAddress = new sap.m.Column();
            var labelshipAddress = new sap.m.Label();
            labelshipAddress.bindProperty("text","i18n>shipAddress");
            columnshipAddress.setHeader(labelshipAddress);
            newTableJson.addColumn(columnshipAddress);

            var ColumnListItem = new sap.m.ColumnListItem();

            var cellOrderID = new sap.m.Label();
            cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
            ColumnListItem .addCell(cellOrderID);

            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight");
            ColumnListItem .addCell(cellFreight);

            var cellshipAddress = new sap.m.Label();
            cellshipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
            ColumnListItem .addCell(cellshipAddress);

            var oBindingInfo = {
                model : "jsonEmployees",
                path: "Orders",
                template: ColumnListItem
            };

            newTableJson.bindAggregation("items", oBindingInfo);
            newTableJson.bindElement("jsonEmployees>" + oContext.getPath());

            ordersTable.addItem(newTableJson);
        };

        function showEmployee(oEvent){
            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            this._bus.publish("fexible","showEmployee", path);
        };

        function showOrdersNew(oEvent){
            var iconPressed = oEvent.getSource();
            var oContext = iconPressed.getBindingContext("odataNorthwind");
            
            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.employees.fragment.DialogOrders",this);
                this.getView().addDependent(this._oDialogOrders);    
            } 

            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
            this._oDialogOrders.open();


            
        };

        function onCloseOrder(){
            this._oDialogOrders.close();
        };

        Main.prototype.onValidate = function () {
            var inputEmployee = this.byId("inputEmpleyee");
            var valueEmployee = inputEmployee.getValue();


            if (valueEmployee.length === 6) {
                inputEmployee.setDescription("OK");
                this.byId("labelCountry").setVisible(true);
                this.byId("slCountry").setVisible(true);
            } else {
                inputEmployee.setDescription("Not OK");
                this.byId("labelCountry").setVisible(false);
                this.byId("slCountry").setVisible(false);
            }
        };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showPostalCode = showPostalCode;
        Main.prototype.onHideShow = onHideShow;
        Main.prototype.onShowDetail = onShowDetail;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrder = showOrder;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.showOrdersNew = showOrdersNew;
        Main.prototype.onCloseOrder = onCloseOrder;
        Main.prototype.showEmployee = showEmployee;

        return Main;
    });

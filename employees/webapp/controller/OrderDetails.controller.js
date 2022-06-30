sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         * @param {typeof sap.ui.core.routing.History} History
         * @param {typeof sap.m.MessageBox} MessageBox
         * @param {typeof sap.ui.model.Filter} Filter
         * @param {typeof sap.ui.model.FilterOperator} FilterOperator
         */
    function (Controller,History,MessageBox,Filter,FilterOperator) {
        "use strict";

        var Main = Controller.extend("logaligroup.employees.controller.OrderDetails", {});

        function _onObjectMatched(oEvent){

            this.onClearSignature();

            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
                model: "odataNorthwind",
                events : {
                    dataReceived: function (oData) {
                        _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                    }.bind(this)
                }
            });

            const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders("
                                        + oEvent.getParameter("arguments").OrderID + ")"
                                ).getObject();

            
            if (objContext) {
                _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);    
            }
            
        };

        function _readSignature(orderId,employeeId){
            this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='"+ orderId +"',SapId='"+ this.getOwnerComponent().SapId +"',EmployeeId='"+ employeeId +"')",{
                success: function(data){
                    const signature = this.getView().byId("signature");
                    if (!data.MediaContent !=="") {
                        signature.setSignature("data:image/png;base64,"+data.MediaContent)  ;    
                    }                   
                    
                }.bind(this),
                error: function(data){

                }
            });

            // read files
            this.byId("uploadCollection").bindAggregation("items",{
                path : "incidenceModel>/FilesSet",
                filters : [
                    new Filter("OrderId",FilterOperator.EQ, orderId),
                    new Filter("SapId",FilterOperator.EQ, this.getOwnerComponent().SapId),
                    new Filter("EmployeeId",FilterOperator.EQ, employeeId)
                ],
                template : new sap.m.UploadCollectionItem({
                    documentId: "{incidenceModel>AttId}",
                    visibleEdit: false,
                    fileName : "{incidenceModel>FileName}"
                }).attachPress(this.downloadFile)
            });
        };

        function onInit() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
        };

        function onBack(oEvent) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined ) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain",true);
            }
        };

        function onClearSignature(oEvent){
            var signature = this.byId("signature");
            signature.clear();
        };

        function factoryOrderDetails(listId,oContext){
            var contextObject = oContext.getObject();
            contextObject.Currency = "EUR";
            var unitsInSotck = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if (contextObject.Quantity <= unitsInSotck) {
                var objectListItem = new sap.m.ObjectListItem({
                    title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                    number: "{parts: [{path:'odataNorthwind>UnitPrice'}, {path:'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency, formatOption: {showMeasure: false}'}",
                    numberUnit: "{odataNorthwind>Currency}"
                });
                return objectListItem;
            } else {
                var customListItem = new sap.m.CustomListItem({
                    content:[
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"}),
                            contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error"}),
                            contentRight: new sap.m.Label({ text: "{parts: [{path:'odataNorthwind>UnitPrice'}, {path:'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency, formatOption: {showMeasure: false}'}"})
                        })
                    ]
                });
                return customListItem;
            }
        };

        function onSaveSignature (oEvent){
            const signature = this.byId("signature");
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var signaturePng;

            if (!signature.isFill()) {
                MessageBox.error(oResourceBundle.getText("fillSignature"));
            } else {
                signaturePng = signature.getSignature().replace("data:image/png;base64,","");
                let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
                let body = {
                    OrderId : objectOrder.OrderID.toString(),
                    SapId : this.getOwnerComponent().SapId,
                    EmployeeId : objectOrder.EmployeeID.toString(),
                    MimeType : "image/png",
                    MediaContent : signaturePng
                };

                this.getView().getModel("incidenceModel").create("/SignatureSet",body,{
                    success: function () {
                        MessageBox.success(oResourceBundle.getText("signatureSave"));
                    },
                    error: function () {
                        MessageBox.error(oResourceBundle.getText("SignatureNotSave"));
                    }
                });
            }
        };

        function onFileBeforeUpload (oEvent){
            let fileName = oEvent.getParameter("fileName");
            let objContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name : "slug",
                value : objContext.OrderID + ";" 
                        + this.getOwnerComponent().SapId + ";" 
                        + objContext.EmployeeID + ";" 
                        + fileName
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        };

        function onFileChange (oEvent){
            let oUploadCollection = oEvent.getSource();

            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name : "x-csrf-token",
                value : this.getView().getModel("incidenceModel").getSecurityToken()
            });

            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        };

        function onFileUploadComplete (oEvent){
            oEvent.getSource().getBinding("items").refresh();
        };

        function onFileDeleted (oEvent){
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();
            this.getView().getModel("incidenceModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function (){

                }
            }).bind(this);
        };

        function downloadFile (oEvent){
            const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
            window.open("sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
        };

        Main.prototype.onInit = onInit;
        Main.prototype.onBack = onBack;
        Main.prototype.onClearSignature = onClearSignature;
        Main.prototype.factoryOrderDetails = factoryOrderDetails;
        Main.prototype.onSaveSignature = onSaveSignature;
        Main.prototype.onFileBeforeUpload = onFileBeforeUpload;
        Main.prototype.onFileChange = onFileChange;
        Main.prototype.onFileUploadComplete = onFileUploadComplete;
        Main.prototype.onFileDeleted = onFileDeleted;
        Main.prototype.downloadFile = downloadFile;

        return Main;
    }
);
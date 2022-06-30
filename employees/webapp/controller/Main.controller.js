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

        var Main = Controller.extend("logaligroup.employees.controller.Main", {});

        function onInit() {
            var oView = this.getView();
            // var i18nBundle = oView.getModel("i18n").getResourceBundle();

            var oJSONModel = new sap.ui.model.json.JSONModel();
            oJSONModel.loadData("./model/json/Employees.json", false);
            oView.setModel(oJSONModel, "jsonEmployees");

            var oJSONModelCountries = new sap.ui.model.json.JSONModel();
            oJSONModelCountries.loadData("./model/json/Countries.json", false);
            oView.setModel(oJSONModelCountries, "jsonCountries");

            var oJSONModelLayout = new sap.ui.model.json.JSONModel();
            oJSONModelLayout.loadData("./model/json/Layout.json", false);
            oView.setModel(oJSONModelLayout, "jsonLayout");

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleID: true,
                visiblenName: true,
                visibleIDCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });
            oView.setModel(oJSONModelConfig, "jsonConfig");

            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("fexible", "showEmployee", this.showEmployeeDetails, this);

            this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveOdataIncidence, this);

            this._bus.subscribe('incidence', 'onDeleteIncidence', function (chanelId, eventId, data) {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                this.getView().getModel("incidenceModel").remove(
                    "/IncidentsSet(IncidenceId='" + data.IncidenceId +
                    "',SapId='" + data.SapId +
                    "',EmployeeId='" + data.EmployeeId + "')",  {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(data.EmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteOK"));
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteKO"));
                    }.bind(this)
                }
                );
            }, this);
        };

        function showEmployeeDetails(category, nameEvent, path) {
            var detailView = this.getView().byId("detailEmployeeView");
            detailView.bindElement("odataNorthwind>" + path);
            this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

            var incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel, "incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();

            this.onReadODataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);

        };

        function onBeforeRendering() {
            this._detailEmployeeView = this.getView().byId("detailEmployeeView");
        };

        function onSaveOdataIncidence(chanelId, eventId, data) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
            var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

            if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {

                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: employeeId.toString(),
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    Type: incidenceModel[data.incidenceRow].Type,
                    Reason: incidenceModel[data.incidenceRow].Reason
                };

                this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        //sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));
                        MessageBox.success(oResourceBundle.getText("odataSaveOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                    }.bind(this)
                });
            } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                incidenceModel[data.incidenceRow].ReasonX ||
                incidenceModel[data.incidenceRow].TypeX
            ) {
                var body = {
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                    Type: incidenceModel[data.incidenceRow].Type,
                    TypeX: incidenceModel[data.incidenceRow].TypeX,
                    Reason: incidenceModel[data.incidenceRow].Reason,
                    ReasonX: incidenceModel[data.incidenceRow].ReasonX
                };

                this.getView().getModel("incidenceModel").update(
                    "/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                    "',SapId='" + incidenceModel[data.incidenceRow].SapId +
                    "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateOK"));
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                    }.bind(this)
                }
                );
            }
            else {
                sap.m.MessageToast.show(oResourceBundle.getText("odataNoChanges"));
            }

        };

        function onReadODataIncidence(employeeID) {
            this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                filters: [
                    new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                    new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString())
                ],
                success: function (data) {
                    var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                    incidenceModel.setData(data.results);
                    var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                    tableIncidence.removeAllContent();

                    for (var incidence in data.results) {
                        data.results[incidence]._ValidateDate = true;
                        data.results[incidence].EnabledSave = false;

                        var newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + incidence);
                        tableIncidence.addContent(newIncidence);
                    }
                }.bind(this),
                error: function (e) {

                }
            });
        };

        Main.prototype.onInit = onInit;
        Main.prototype.showEmployeeDetails = showEmployeeDetails;
        Main.prototype.onBeforeRendering = onBeforeRendering;
        Main.prototype.onSaveOdataIncidence = onSaveOdataIncidence;
        Main.prototype.onReadODataIncidence = onReadODataIncidence

        return Main;
    }
);    
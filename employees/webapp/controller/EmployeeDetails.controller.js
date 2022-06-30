// @ts-nocheck
sap.ui.define([
    "logaligroup/employees/controller/Base.controller",
    "logaligroup/employees/model/formatter",
    "sap/m/MessageBox"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
    function (Controller, formatter, MessageBox) {
        "use strict";

        var Main = Controller.extend("logaligroup.employees.controller.MasterEmployee", {});

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCeateIncidence() {
            var tableIncidence = this.getView().byId("tableIncidence");
            var newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this);
            var incidenceModel = this.getView().getModel("incidenceModel");
            var odata = incidenceModel.getData();
            var index = odata.length;
            odata.push({
                index: index + 1,
                _ValidateDate: false,
                EnabledSave: false
            });
            incidenceModel.refresh();
            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {
            // var tableIncidence = this.getView().byId("tableIncidence");
            // var rowIncidence = oEvent.getSource().getParent().getParent();
            // var incidenceModel = this.getView().getModel("incidenceModel");
            // var odata = incidenceModel.getData();
            // var contextObj = rowIncidence.getBindingContext("incidenceModel").getObject();

            // odata.splice(contextObj.index -1,1);
            // for (var i in odata) {
            //     odata[i].index = parseInt(i) + 1;
            // };

            // incidenceModel.refresh();
            // tableIncidence.removeContent(rowIncidence);

            // for (var j in tableIncidence.getContent()) {
            //     tableIncidence.getContent()[j].bindElement("incidenceModel>/"+j);

            // }
            var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();

            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        this._bus.publish('incidence', 'onDeleteIncidence', {
                            IncidenceId: contextObj.IncidenceId,
                            SapId: contextObj.SapId,
                            EmployeeId: contextObj.EmployeeId
                        });
                    }
                }.bind(this)
            });
        };

        function onSaveIncidence(oEvent) {
            var incidence = oEvent.getSource().getParent().getParent();
            var incidenceRow = incidence.getBindingContext("incidenceModel");
            this._bus.publish("incidence", "onSaveIncidence", {
                incidenceRow: incidenceRow.sPath.replace('/', '')
            });

        };

        function updateIncidenceCreationDate(oEvent) {


            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) {
                contextObj._ValidateDate = false;
                contextObj.CreationDateState = "Error";
                MessageBox.error(oResourceBundle.getText("errorCreateionDateValue"), {
                    title: "Error",
                    onClose: null,
                    styleClass: "",
                    actions: MessageBox.Action.Close,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            } else {
                contextObj._ValidateDate = true;
                contextObj.CreationDateState = "None";
                contextObj.CreationDateX = true;
            };

            if (oEvent.getSource().isValidValue() && contextObj.Reason) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            }

            context.getModel().refresh();


        };

        function updateIncidenceReason(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            if (oEvent.getSource().getValue()) {
                contextObj.ReasonX = true;
                contextObj.ReasonState = "None";
            } else {
                contextObj.ReasonState = "Error";
            };

            if (contextObj._ValidateDate && oEvent.getSource().getValue()) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            };

            context.getModel().refresh();
        };

        function updateIncidenceType(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();

            if (contextObj._ValidateDate && contextObj.Reason) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            };


            contextObj.TypeX = true;
            context.getModel().refresh();
        };
      

        Main.prototype.onInit = onInit;
        Main.prototype.onCeateIncidence = onCeateIncidence;
        Main.prototype.Formatter = formatter;
        Main.prototype.onDeleteIncidence = onDeleteIncidence;
        Main.prototype.onSaveIncidence = onSaveIncidence;
        Main.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        Main.prototype.updateIncidenceReason = updateIncidenceReason;
        Main.prototype.updateIncidenceType = updateIncidenceType;



        return Main;
    }
);    
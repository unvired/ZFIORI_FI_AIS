

sap.ui.define(
  [
    "./BaseController",
    "com/wel/assetstandardcost/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/BusyDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (e, t, s, o, n, l, a, i, r) {
    "use strict";
    return e.extend("com.wel.assetstandardcost.controller.Main", {
      formatter: t,
      onInit: function () {
        console.log("MAIN CONTROLLER || ONINIT");
        this._busyDialog = new n();
        this._service = { rowItemsToPost: [], canContinueFlag: true };
        this._getTableDataFromServer();
        this._createParentModel();
      },
      _createParentModel: function () {
        console.log("create parent model");
        const e = { isFieldEditable: false };
        const t = new l(e);
        this.setModel(t, "parentModel");
      },
      onAfterRendering: function () {},
      _createNewAWLCostModel: function () {
        console.log("NEW AWL MODEL");
        const e = {
          SubClass: "",
          SubClassDesc: "",
          AssetClass: "",
          SubClassValueState: "None",
        };
        const t = new l(e);
        this.setModel(t, "newAISJsonModel");
      },
      _getTableDataFromServer: async function () {
        const e = "/AISSet";
        this._busyDialog.open();
        try {
          this._getData(e, []);
        } catch (e) {
          console.log("error occurred", e);
        } finally {
          this._busyDialog.close();
        }
      },
      onTableSearch: function (e) {
        const t = e.getParameter("newValue");
        const n = this.byId("id_awl_cost_table").getBinding("rows");
        let l = [];
        if (t) {
          l = new s(
            [
              new s("SubClass", o.EQ, t),
              new s("SubClassDesc", o.Contains, t),
              new s("AssetClass", o.Contains, t),
            ],
            false,
          );
        }
        n.filter(l, "Application");
      },
      _getData: async function (e, t) {
        console.log("in _getData");
        const s = await this.getDataFromServer(e, {}, t);
        console.log("GET DATA REPORT SET >> ", s);
        this._service.canContinueFlag = true;
        s.results.forEach((e) => {
          e.StdCost = parseFloat(e.StdCost).toFixed(2);
          e.StdLife = parseFloat(e.StdLife).toFixed(2);
          e.Z11kv = parseFloat(e.Z11kv).toFixed(2);
          e.Z33kv = parseFloat(e.Z33kv).toFixed(2);
          e.Zlv = parseFloat(e.Zlv).toFixed(2);
        });
        const o = new l({ results: s.results });
        console.log("GET DATA", s.results);
        this.setModel(o, "oJsonAISSetModel");
      },
      onDeleteRowButtonPress: async function (e) {
        const t = this;
        const s = e.getSource().getParent().getParent();
        const o = s.getSelectedIndices();
        const n = this.getResourceBundle();
        console.log(o);
        console.log("indices of items to delete -> ", o);
        if (this._service.canContinueFlag) {
          console.log("user can continue to other action||");
          this._handleRowDelete(o, s);
        } else {
          const e = n.getText("MainController.saveConfirmMessage");
          this._showConfirmationMessage(e).then((e) => {
            if (e === "YES") {
              t.createPostRequest();
              console.log(
                "user wants to save before continuing to any other action",
              );
            } else {
              console.log(
                "canContinue is false ||NO PRESSED || user wants to delete anyway",
              );
              t._service.canContinueFlag = true;
              t._handleRowDelete(o, s);
            }
          });
        }
      },
      _handleRowDelete: function (e, t) {
        const s = this.getResourceBundle();
        const o = this;
        if (!e.length) {
          this.displayMessage(
            "Error",
            s.getText("MainController.NoRowsSelected"),
          );
        } else {
          let n = s.getText("MainController.deleteConfirm");
          i.warning(n, {
            actions: [i.Action.YES, i.Action.NO],
            onClose: function (s) {
              if (s === "YES") o._deleteRows(e, t);
            },
          });
        }
      },
      _deleteRows: async function (e, t) {
        const s = this.getModel("oJsonAISSetModel");
        const o = s.getProperty("/results");
        const l = this.getResourceBundle();
        let a = o.filter((t, s) => !e.includes(s));
        let i = o.filter((t, s) => e.includes(s));
        console.log("TO-DELETE ROWS", i);
        const r = new n({ title: "DELETING..." });
        r.open();
        let c = l.getText("MainController.SuccessDeleteMessageSingle");
        if (i.length > 1) {
          c = l.getText("MainController.SuccessDeleteMessageMultiple");
        }
        try {
          for (let e of i) {
            const t = `/AISSet(SubClass='${e.SubClass}')`;
            const s = await this.deleteDataRequestToServer(t);
            console.log("DELETE SUCCESS", s);
          }
          this._getData("/AISSet", []);
          this.displayMessage("Success", c);
          this.getModel("parentModel").setProperty("/isFieldEditable", false);
        } catch (e) {
          console.log(e);
          this.displayMessage(
            "Error",
            JSON.parse(e.responseText).error.message.value,
          );
        } finally {
          r.close();
        }
        s.setProperty("/results", a);
        t.clearSelection();
      },
      onSwitchStateChange: function (e) {
        const t = e.getParameter("state");
        console.log("BUTTON ENABLED?", t);
        this.getModel("parentModel").setProperty("/isCreateEnabled", t);
        this.getModel("parentModel").setProperty("/isFieldEditable", t);
      },
      onCancelButtonPress: function (e) {
        console.log("CANCEL BUTTON PRESSED");
        const t = this;
        const s = this.getResourceBundle();
        if (this._service.canContinueFlag) {
          console.log("user can continue to other action");
          this._continueCancelAction();
        } else {
          const e = s.getText("MainController.saveConfirmMessage");
          this._showConfirmationMessage(e).then((e) => {
            if (e === "YES") {
              t.createPostRequest();
              console.log(
                "user wants to SAVE before continuing to any other action",
              );
            } else {
              console.log(
                "canContinue is false || NO PRESSED || user wants to cancel anyway",
              );
              t._service.canContinueFlag = true;
              this._continueCancelAction();
            }
          });
        }
      },
      _continueCancelAction: function () {
        this._getData("/AISSet", []);
        this.getModel("parentModel").setProperty("/isFieldEditable", false);
        const e = this.getResourceBundle().getText(
          "MainController.onCancelPressMessage",
        );
        r.show(e, { duration: 2e3 });
      },
      onCreateNewAWLCost: function (e) {
        console.log("In Create New AWL Dialog");
        const t = this;
        const s = this.getResourceBundle();
        if (this._service.canContinueFlag) {
          console.log("user can continue to other action||");
          this._onCreateDialogOpen();
        } else {
          const e = s.getText("MainController.saveConfirmMessage");
          this._showConfirmationMessage(e).then((e) => {
            if (e === "YES") {
              t.createPostRequest();
              console.log(
                "user wants to save before continuing to any other action",
              );
            } else {
              console.log(
                "canContinue is false ||NO PRESSED || user wants to delete anyway",
              );
              t._service.canContinueFlag = true;
              t._onCreateDialogOpen();
            }
          });
        }
      },
      _onCreateDialogOpen: function () {
        this._createNewAWLCostModel();
        if (!this._oAISCostDialog) {
          this._oAISCostDialog = sap.ui.xmlfragment(
            "com.wel.assetstandardcost.fragments.NewAISSet",
            this,
          );
          this.getView().addDependent(this._oAISCostDialog);
        }
        this._oAISCostDialog.open();
      },
      onCloseDialogButtonPress: function (e) {
        console.log(e);
        e.getSource().getParent().close();
      },
      createPostRequest: async function () {
        debugger;
        console.log("create/update post functioin ");
        const e = this._service.rowItemsToPost;
        const t = this.getModel("oJsonAISSetModel");
        const s = t.getProperty("/results");
        const o = this.getResourceBundle();
        let n = [];
        n = s.filter((t, s) => e.includes(t.SubClass));
        console.log(n);
        this._service.rowItemsToPost = [];
        if (!n.length) {
          this.displayMessage(
            "Error",
            o.getText("MainController.notingtoPost"),
          );
        } else {
          this._continuePosting(n);
        }
      },
      _continuePosting: async function (e) {
        const t = new n({ title: "POSTING..." });
        const s = this.getResourceBundle();
        t.open();
        let o = s.getText("MainController.SuccessUpdateMessageSingle");
        if (e.length > 1) {
          o = s.getText("MainController.SuccessUpdateMessageMultiple");
        }
        try {
          for (let t of e) {
            t.StdCost = t.StdCost.toString();
            t.StdLife = t.StdLife.toString();
            t.Z11kv = t.Z11kv.toString();
            t.Z33kv = t.Z33kv.toString();
            t.Zlv = t.Zlv.toString();
            const e = `/AISSet(SubClass='${t.SubClass}')`;
            console.log("Before post data", t);
            delete t.__metadata;
            const s = await this.updateDataToServer(e, t);
            console.log("create success response", s);
            this.getModel("parentModel").setProperty("/isFieldEditable", false);
          }
          this._getData("/AISSet", []);
          this.displayMessage("Success", o);
        } catch (e) {
          console.log(e);
          this.displayMessage(
            "Error",
            JSON.parse(e.responseText).error.message.value,
          );
        } finally {
          t.close();
        }
      },
      onSubClassValueHelpPress: function () {
        console.log("abjecttype value help pressed");
        var e = this.getView();
        if (!this.byId("createawlid")) {
          a.load({
            name: "com.wel.assetstandardcost.fragments.ValueHelpDialogAssetSubClass",
            controller: this,
          }).then(
            function (t) {
              e.addDependent(t);
              t.open();
            }.bind(this),
          );
        } else {
          this.byId("createawlid").open();
        }
      },
      onCreateNewAILAssetCost: async function () {
        console.log("on CREATE NEW AWL");
        const e = this.getModel("newAISJsonModel").getProperty("/SubClass");
        if (!e) {
          this.getModel("newAISJsonModel").setProperty(
            "/SubClassValueState",
            "Error",
          );
        } else {
          this._createNewAwlCost();
        }
      },
      _createNewAwlCost: async function () {
        console.log("data post functioin || DIALOG ");
        const e = this.getModel("newAISJsonModel");
        const t = e.getProperty("/");
        const s = this.getResourceBundle();
        console.log("Dialog create", t);
        delete t.SubClassValueState;
        const o = new n({ title: "CREATING..." });
        o.open();
        try {
          const e = `/AISSet`;
          const n = await this.postDataToServer(e, t);
          console.log("SUCCESS RESPONSE", n);
          this._getData("/AISSet", []);
          this._oAISCostDialog.close();
          this._createNewAWLCostModel();
          this.displayMessage(
            "Success",
            s.getText("MainController.SuccessCreateMessage"),
          );
          this.getModel("parentModel").setProperty("/isFieldEditable", true);
        } catch (e) {
          console.log(e);
          this.displayMessage(
            "Error",
            JSON.parse(e.responseText).error.message.value,
          );
        } finally {
          o.close();
        }
      },
      onTextChange: function (oEvent) {
        const oRow = oEvent.getSource()
            .getBindingContext("oJsonAISSetModel")
            .getObject();

        if (!this._service.rowItemsToPost.includes(oRow.SubClass)) {
            this._service.rowItemsToPost.push(oRow.SubClass);
        }
      },
      onInputValueChange: function (e) {
        debugger;
        this._service.canContinueFlag = false;
        const t = e.getSource();
        let s = e.getParameter("newValue") || "";
        console.log(s);
        if (s[0] === "0" && s[1] !== ".") {
          s = s.slice(1);
        }
        console.log(s);
        if (!t.getId().includes("id_subclasscat")) {
          let e;
          t.getId().includes("id_stdCost")
            ? (e = /^[0-9]{0,10}(?:\.[0-9]{0,2})?$/)
            : (e = /^[0-9]{0,3}(?:\.[0-9]{0,2})?$/);
          const o = s.match(e);
          if (!(o !== null && o.input !== "")) {
            s = s.slice(0, -1) || 0;
            t.setValue(s);
          }
        }
        t.setValue(s);
        const o = e.getSource().getBindingContext("oJsonAISSetModel");
        const n = o.getObject();
        if (!this._service.rowItemsToPost.includes(n.SubClass)) {
          this._service.rowItemsToPost.push(n.SubClass);
        }
      },
      onSearchSubClass: function (e) {
        console.log("SUB CLASS SEARCH FN");
        var t = e.getParameter("value");
        var n = [];
        n = new s(
          [
            new s("SubClass", o.Contains, t.toUpperCase()),
            new s("SubClassDesc", o.Contains, t.toUpperCase()),
          ],
          false,
        );
        var l = e.getParameter("itemsBinding");
        l.filter([n]);
      },
      onAssetSubclassDialogClose: function (e) {
        console.log("SELECTED ITEM", e);
        this.getModel("newAISJsonModel").setProperty(
          "/SubClassValueState",
          "None",
        );
        const t = e.getParameter("selectedItem");
        if (t) {
          const e = this.getModel("newAISJsonModel").getProperty("/");
          e.SubClass = t.getTitle();
          e.SubClassDesc = t.getDescription();
          e.AssetClass = t.getInfo();
          this.getModel("newAISJsonModel").setProperty("/", e);
        } else {
          console.log("NO ITEM SELECTED");
        }
      },
      onToggleButtonPress: function (e) {
        const t = e.getParameter("pressed");
        console.log("BUTTON ENABLED?", t);
        this.getModel("parentModel").setProperty("/isCreateEnabled", t);
        this.getModel("parentModel").setProperty("/isFieldEditable", t);
      },
      _showConfirmationMessage: function (e) {
        return new Promise((t, s) => {
          i.confirm(e, { actions: [i.Action.YES, i.Action.NO], onClose: t });
        });
      },
    });
  },
);

sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/m/MessageBox"],
  function (Controller, History, MessageBox) {
    "use strict";

    return Controller.extend("com.wel.assetstandardcost.controller.BaseController", {
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      getDataFromServer: function (sPath, urlParam, filters) {
        return new Promise((resolve, reject) => {
          let oDataModel = this.getOwnerComponent().getModel();

          let onSuccess = (oData) => resolve(oData);
          let onError = (err) => reject(err);

          oDataModel.read(sPath, {
            filters: filters,
            urlParameters: urlParam,
            success: onSuccess,
            error: onError,
            async: true,
          });
        });
      },

      postDataToServer: function (sPath, oEntity = {}) {
        return new Promise((resolve, reject) => {
          let oDataModel = this.getOwnerComponent().getModel();

          let onSuccess = (oData) => resolve(oData);
          let onError = (err) => reject(err);

          oDataModel.create(sPath, oEntity, {
            success: onSuccess,
            error: onError,
            async: true,
          });
        });
      },

      updateDataToServer: function (sPath, oEntity) {
        return new Promise((resolve, reject) => {
          let oDataModel = this.getOwnerComponent().getModel();

          let onSuccess = (oData) => resolve(oData);
          let onError = (err) => reject(err);

          oDataModel.update(sPath, oEntity, {
            method: "PUT",
            success: onSuccess,
            error: onError,
            async: true,
          });
        });
      },

      deleteDataRequestToServer: function (sPath) {
        return new Promise((resolve, reject) => {
          let oDataModel = this.getOwnerComponent().getModel();

          let onSuccess = (oData) => resolve(oData);
          let onError = (err) => reject(err);

          oDataModel.remove(sPath, {
            method: "DELETE",
            success: onSuccess,
            error: onError,
            async: true,
          });
        });
      },

      displayMessage: function (sType, sMsg) {
        switch (sType) {
          case "Error":
            MessageBox.error(sMsg);
            break;
          case "Warning":
            MessageBox.warning(sMsg);
            break;
          case "Alert":
            MessageBox.alert(sMsg);
            break;
          case "Success":
            MessageBox.success(sMsg);
            break;
          default:
            break;
        }
      },
    });
  }
);

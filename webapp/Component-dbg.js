sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "com/wel/assetstandardcost/model/models"],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("com.wel.assetstandardcost.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        console.log(
          "%c LOGS ARE DISABLED",
          "font-size:35px;font-family:'Lexend deca',sans-serif;color:#7fc3ff;text-shadow:3px 3px #0b0b0b",
          "console"
        );

        // disable console.logs before deploying;
        // To enable console.log comment below line
        console.log = function () {};
      },
    });
  }
);

sap.ui.define(
  ["sap/ca/ui/model/format/NumberFormat", "sap/ca/ui/model/format/DateFormat"],
  function (NumberFormat, DateFormat) {
    "use strict";

    return {
      oDateFormat: function (sValue) {
        if (sValue) {
          var selectedDateFormat = sap.ui.core.format.DateFormat.getDateInstance(
            { style: "medium" },
            sap.ui.getCore().getConfiguration().getLocale()
          );
          var formattedDate = selectedDateFormat.format(sValue);
          return formattedDate;
        }
      },
    };
  }
);

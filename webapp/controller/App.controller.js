sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbarButton",
	'sap/ui/core/Fragment',
	"sap/m/Popover"
], function(BaseController, JSONModel, OverflowToolbarButton, Fragment, Popover) {
	"use strict";


	return BaseController.extend("uol.bpc.ManageVDT.controller.App", {
		
		onInit: function() {
			
		},
		
		onSideMenuSelect: function(oEvent){
			var oItem = oEvent.getParameter("item"),
				oCtx = oItem.getBindingContext("odata"),
				sMenu = oItem.getText();
				
			var oRouter = this.getRouter();
				
			switch(sMenu){
				case "Room Revenue": 
					oRouter.navTo("driverNetwork",{
						drivername : oCtx.getProperty("Name")
					}); break;
				case "MOD Revenue": 
					oRouter.navTo("driverNetwork",{
						drivername : oCtx.getProperty("Name")
					}); break;	
				default:
					oRouter.navTo("notFound");break;
			}
		}

	});
});
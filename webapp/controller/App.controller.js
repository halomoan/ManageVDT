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
		
		onNavSelect: function(oEvent){
			var oItem = oEvent.getParameter("item"),
				sMenu = oItem.getText();
				
			var oRouter = this.getRouter();
				
			
			switch(sMenu){
				case "Room Revenue": 
					oRouter.navTo("revenueNetwork"); break;
			}
		}

	});
});
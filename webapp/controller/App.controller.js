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
				//sMenu = oItem.getText(),
				sType = oItem.getTarget();
				
		
			var oRouter = this.getRouter();
				
			switch(sType){
				// case "DRIVER": 
				// 	oRouter.navTo("driverNetwork",{
				// 		drivername : oCtx.getProperty("Name")
				// 	}); break;
				case "DRIVER": 
					oRouter.navTo("driverNetwork",{
						drivername : oCtx.getProperty("Name")
					}); break;	
					
				case "ALLOCATION": 
					oRouter.navTo("allocation",{
						allocname : oCtx.getProperty("Name")
					}); break;	
				default:
					oRouter.navTo("notFound");break;
			}
		},
		
		onToggleSideNavPress: function(oEvent) {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},
		
		_setToggleButtonTooltip: function(bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Expand');
			} else {
				oToggleButton.setTooltip('Collapse');
			}
		}


	});
});
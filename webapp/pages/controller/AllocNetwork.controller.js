sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
], function(BaseController,RowAction,RowActionItem,RowSettings) {
	"use strict";

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.AllocNetwork", {

		
		onInit: function() {
			
			var fnPress = this.handleActionPress.bind(this);
			
			this.modes = [
				{
					key: "Navigation",
					text: "Navigation",
					handler: function(){
						var oTemplate = new RowAction({items: [
							new RowActionItem({
								type: "Navigation",
								press: fnPress,
								visible: "{odata>Active}"
							})
						]});
						return [1, oTemplate];
					}
				},{
					key: "NavigationDelete",
					text: "Navigation & Delete",
					handler: function(){
						var oTemplate = new RowAction({items: [
							new RowActionItem({
								type: "Navigation",
								press: fnPress,
								visible: "{odata>Active}"
							}),
							new RowActionItem({type: "Delete", press: fnPress})
						]});
						return [2, oTemplate];
					}
				},{
					key: "NavigationCustom",
					text: "Navigation & Custom",
					handler: function(){
						var oTemplate = new RowAction({items: [
							new RowActionItem({
								type: "Navigation",
								press: fnPress,
								visible: "{odata>Active}"
							}),
							new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnPress})
						]});
						return [2, oTemplate];
					}
				},{
					key: "Multi",
					text: "Multiple Actions",
					handler: function(){
						var oTemplate = new RowAction({items: [
							new RowActionItem({icon: "sap-icon://attachment", text: "Attachment", press: fnPress}),
							new RowActionItem({icon: "sap-icon://search", text: "Search", press: fnPress}),
							new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnPress}),
							new RowActionItem({icon: "sap-icon://line-chart", text: "Analyze", press: fnPress})
						]});
						return [2, oTemplate];
					}
				},{
					key: "None",
					text: "No Actions",
					handler: function(){
						return [0, null];
					}
				}
			];
			this.switchState("Navigation");
			this.oRouter = this.getRouter();

		},
		
		handleActionPress : function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");
			
			sap.m.MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
				this.getModel("odata").getProperty("ID", oRow.getBindingContext("odata")));
			
			var oFCL = this.getView().getParent().getParent();
			
			// var oNextUIState = this.getFCLHelper().getNextUIState(1),
			// 	sId = this.getModel("odata").getProperty("ID", oRow.getBindingContext("odata"));
			// this.oRouter.navTo("detail", {layout: oNextUIState.layout, Id: sId});
			oFCL.setLayout(this.LayoutType.TwoColumnsMidExpanded);
			
		},
		
		switchState : function(sKey) {
			var oTable = this.byId("table");
			var iCount = 0;
			var oTemplate = oTable.getRowActionTemplate();
			if (oTemplate) {
				oTemplate.destroy();
				oTemplate = null;
			}

			for (var i = 0; i < this.modes.length; i++) {
				if (sKey === this.modes[i].key) {
					var aRes = this.modes[i].handler();
					iCount = aRes[0];
					oTemplate = aRes[1];
					break;
				}
			}

			oTable.setRowActionTemplate(oTemplate);
			oTable.setRowActionCount(iCount);
		},
		
		onExit: function() {
		
		}

	});

});
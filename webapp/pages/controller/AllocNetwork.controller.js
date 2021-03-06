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
		

		},
		
		handleActionPress : function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oItem = oEvent.getParameter("item");
			var regex = /^\/\w+\(\'[\w|\d]+\'\)/g;
			
			// sap.m.MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
			// 	this.getModel("odata").getProperty("ID", oRow.getBindingContext("odata")));
	
			
			var sID = this.getModel("odata").getProperty("ID", oRow.getBindingContext("odata"));
			var oContext = oRow.getBindingContext("odata");
			var sPath = oContext.sDeepPath.match(regex)[0];
		
			
			var oItemTemplate = new sap.ui.core.Item({text:"{odata>Name}"});
			var oGeneralDep = sap.ui.getCore().byId("__component0---allocDetail--subAllocGeneral--generalDep");
			var oFilters = [ new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.NE, sID)];
		
			oGeneralDep.bindItems("odata>" + sPath + "/Items",oItemTemplate,null, oFilters);
			
			
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(this.LayoutType.TwoColumnsMidExpanded);
			
			var oMidColumn = oFCL.getCurrentMidColumnPage();
			
			
			oMidColumn.bindElement({
				path:  oContext.getPath(),
			 	model: "odata"
			});
			
			
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
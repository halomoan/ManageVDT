sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.DriverList", {

		
		onInit: function() {
		
		},
		
		onMenuSelect: function(oEvent){
			var oSource = oEvent.getSource();
			//var sPath = oSource.getBindingContext("odata").getPath();
			var oData =  oSource.getBindingContext("odata").getObject();
			
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(this.LayoutType.TwoColumnsMidExpanded);
			
			
			var oModel = this.getModel("odata");
			var sUrl = "/BRItemMenuSet(APPSET='" + oData.HeaderID + "',PROCESS='" + oData.Process + "',ACTION='" + oData.Action + "')/Items";
			
			
			oModel.read(sUrl,
			{
			 urlParameters: {
			    "$expand": "Attributes"
			  },
			  success: function(oResult) { 
			  	var oNode = { "nodes": oResult.results };
			  	
			  	console.log(oNode);
			  	
			    var oMidColumn = oFCL.getCurrentMidColumnPage();
			  	
			  	var oGraphModel = new JSONModel(oNode);
			  	
			  	oMidColumn.setModel(oGraphModel, "graphData");
			  	
			  	//sap.ui.controller("uol.bpc.ManageVDT.pages.controller.DriverNetwork").updateNetwork(oNode); 
			  	
			  },
			  error: function(oError) { /* do something */ }
			});
			
			//sap.ui.controller("uol.bpc.ManageVDT.pages.controller.DriverNetwork").updateNetwork(oModel,oData);
			
			//var oMidColumn = oFCL.getCurrentMidColumnPage();
			//oMidColumn.bindElement({
			// 	path:  oContext.getPath(),
			//  	model: "odata"
			//});
		},

		onExit: function() {
		
		}

	});

});
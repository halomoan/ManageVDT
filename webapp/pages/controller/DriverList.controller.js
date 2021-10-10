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
			
			
			var oToolpage =  sap.ui.getCore().byId("__xmlview0--toolPage");
			oToolpage.setSideExpanded(false);

			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(this.LayoutType.TwoColumnsMidExpanded);
			
			
			var oModel = this.getModel("odata");
			var sUrlNode = "/BRMenuSet(APPSET='" + oData.HeaderID + "',PROCESS='" + oData.Process + "',ACTION='" + oData.Action + "')/Nodes",
				sUrlLine = "/BRMenuSet(APPSET='" + oData.HeaderID + "',PROCESS='" + oData.Process + "',ACTION='" + oData.Action + "')/Lines";
			
			oModel.setDeferredGroups(["batchget"]);
			
			oModel.read(sUrlNode,
			{
			 groupId: "batchget",
			 urlParameters: {
			    "$expand": "Attributes,Dimlist,Refdimlist"
			  },
			  success: function(oResult) { 
			  },
			  error: function(oError) { /* do something */ }
			});
			
			oModel.read(sUrlLine,
			{
			  groupId: "batchget",
			  success: function(oResult) { 
			  },
			  error: function(oError) { /* do something */ }
			});
			
			oModel.submitChanges({ 
				groupId: "batchget",
				success: function (oResp) {
					var aResult = oResp.__batchResponses;
					
					var oResult = { "nodes": aResult[0].data.results, "lines": aResult[1].data.results };
					//var oResult = { "nodes": aResult[0].data.results };
					
					var oGraphModel = new JSONModel(oResult);
					oGraphModel.setSizeLimit(200);
					var oMidColumn = oFCL.getCurrentMidColumnPage();
					oMidColumn.setModel(oGraphModel, "graphData");
				
				},
				error: function () {
				}
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
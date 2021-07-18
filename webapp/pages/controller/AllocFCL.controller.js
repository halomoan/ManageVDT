sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController,JSONModel) {
	"use strict";
	
	
	var _globalVar = {};
	
	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.AllocFCL", {

		
		
		onInit: function() {
			var oViewData = {
				"layout" : "OneColumn"
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");
			
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("allocation").attachPatternMatched(this.__onRouteMatched, this);
		},
		
		__onRouteMatched: function(oEvent){
			
			var oOData = this.getModel("odata");
			oOData.metadataLoaded().then(function() {
				oOData.read("/DimensionSet", {
					success: function(oResult) {
						_globalVar.DimensionSet = oResult.results;
					},
					error: function(oError) {
					
					}
				});
				
			});
		},
		onStateChanged: function(oEvent){
			
		},
		
		getGlobalVar: function(){
			if (_globalVar){
				return _globalVar;
			} else{
				return "Hei";
			}
		},
		onExit: function () {
		}

	});

});
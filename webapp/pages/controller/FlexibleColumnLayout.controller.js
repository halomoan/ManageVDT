sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController,JSONModel) {
	"use strict";
	
	

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.FlexibleColumnLayout", {

		
		
		onInit: function() {
			var oViewData = {
				"layout" : "OneColumn"
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");
		},
		
		onStateChanged: function(oEvent){
		
		},
		onExit: function () {
		}

	});

});
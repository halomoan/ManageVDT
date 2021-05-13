sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController,JSONModel) {
	"use strict";
	
	

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.FlexibleColumnLayout", {

		
		
		onInit: function() {
				
			var oData = {
			
			};
			
			var oView = this.getView(),
						oViewData = new JSONModel(oData);
						
						
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("flexColumnLayout").attachPatternMatched(this.__onRouteMatched, this);
			
			
			oView.setModel(oViewData, "viewData");
			
		},
		
		
		
		__onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			console.log(oArguments);
			
			this._updateUIElements();
		},
		
		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");
				
			
			console.log(bIsNavigationArrow,sLayout);

			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: sLayout, product: this.currentProduct, supplier: this.currentSupplier}, true);
			}
		},
		
		_updateUIElements: function () {
			var oModel = this.getModel("viewData");
			var oUIState = this.getFCLHelper().getCurrentUIState();
			console.log(oUIState);
			oModel.setData(oUIState);
		},
		
		
		onExit: function () {
			console.log('EXIT');
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		}

	});

});
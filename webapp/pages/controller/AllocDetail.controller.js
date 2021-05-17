sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.AllocDetail", {

	
		onInit: function() {
			var oViewData = {
				"isFullScreen" : false
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");
		},
		
		onCloseDetail: function(){
			
			var oFCL = this.getView().getParent().getParent();
			
			oFCL.setLayout(this.LayoutType.OneColumn);	
		},
		
		onFullScreen: function () {
			
			var oViewModel = this.getView().getModel("viewData");
			
			oViewModel.setProperty("/isFullScreen",true);
			
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(this.LayoutType.MidColumnFullScreen);
		
		},
		
		onExitFullScreen: function(oEvent){
			var oViewModel = this.getView().getModel("viewData");
			
			oViewModel.setProperty("/isFullScreen",false);
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(this.LayoutType.TwoColumnsMidExpanded);
		},
		
		onPress: function(oEvent){
			alert('Yes');	
		},
		onExit: function() {
		
		}

	});

});
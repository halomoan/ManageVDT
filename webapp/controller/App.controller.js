sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbarButton",
	'sap/ui/core/Fragment',
	"sap/m/Popover"
], function(Controller,JSONModel,OverflowToolbarButton,Fragment,Popover) {
	"use strict";

  /*function hasHiddenParent(oNode) {
		return oNode.getParentNodes().some(function (n) {
			return n.isHidden();
		});
	}

	function hasHiddenChild(oNode) {
		return oNode.getChildNodes().some(function (n) {
			return n.isHidden();
		});
	}*/
	
	
	return Controller.extend("uol.bpc.ManageVDT.controller.App", {
		onInit : function () {
		        //var oData = new JSONModel(sap.ui.require.toUrl("uol/bpc/ManageVDT/model") + "/vdt.json");
		        
		        var 
					sModuleName = "uol/bpc/ManageVDT",
					oModel = new JSONModel(sap.ui.require.toUrl(sModuleName + "/model/graph.json")),
					oView = this.getView(),
					oGraph = oView.byId("graph");

		
			
					oView.setModel(oModel);
					//oGraph.attachBeforeLayouting(hideAllNodes);		
					//oGraph.attachSelectionChange(this.selectionChange, this);
		},
		
		hoverNode: function(oEvent){
			
		
			var oNode = oEvent.getSource();
			
			//if (!this._oPopoverForNode) {
					this._oPopoverForNode = new Popover({
						title: oNode.getTitle(),
						placement: "Top"
					});
			//}
			// Prevents render a default action buttons
			//oEvent.preventDefault();
			
			this._oPopoverForNode.openBy(oNode);
			this._oPopoverForNode = undefined;
			
		},
		
		onOpenVDTNodeSetting: function(oEvent){
			var oButton = oEvent.getSource(),
				oNode = oButton.getParent(),
				oView = this.getView();
				
			// create popover
			if (!this._pVDTSettingPopover) {
				this._pVDTSettingPopover = Fragment.load({
					id: oView.getId(),
					name: "uol.bpc.ManageVDT.fragments.VDTNodeSetting",
					controller: this
				}).then(function(oPopover){
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			console.log(oNode.getKey());
			var oData = oView.getModel().getData().nodes.find(function(element){
				console.log(element.key,element.key == oNode.getKey());
				return element.key === oNode.getKey();
			});
			
			console.log(oData);
			
			this._selectedNode = oNode;
			this._pVDTSettingPopover.then(function(oPopover){
				oPopover.openBy(oNode);
			});	
		},
		onSelectMember: function(oEvent){
			alert(this._selectedNode.getKey());
		}
	});
});
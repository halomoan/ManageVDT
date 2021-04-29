sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbarButton",
	'sap/ui/core/Fragment',
	"sap/m/Popover"
], function(BaseController, JSONModel, OverflowToolbarButton, Fragment, Popover) {
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

	return BaseController.extend("uol.bpc.ManageVDT.controller.App", {
		onInit: function() {

			this._oDSC = this.byId("DynamicSideContent");

			var oViewData = new JSONModel({
				nodeSetting: {
					title: "Node Setting",
					dims:[
					
					]
				}
			});

			var
				sModuleName = "uol/bpc/ManageVDT",
				oGraphModel = new JSONModel(sap.ui.require.toUrl(sModuleName + "/model/graph.json")),
				oDimListModel = new JSONModel(sap.ui.require.toUrl(sModuleName + "/model/dimList.json")),
				oView = this.getView(),
				oGraph = oView.byId("graph");

			oView.setModel(oGraphModel);
			oView.setModel(oDimListModel, "dimlist");
			oView.setModel(oViewData, "viewData");

		},

		pressNode: function(oEvent) {

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

		onOpenVDTNodeSetting: function(oEvent) {
			var oButton = oEvent.getSource(),
				oNode = oButton.getParent(),
				oView = this.getView();

			// create popover
			if (!this._pVDTSettingPopover) {
				this._pVDTSettingPopover = Fragment.load({
					id: oView.getId(),
					name: "uol.bpc.ManageVDT.fragments.VDTNodeSetting",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			var oData = oView.getModel().getData().nodes.find(function(element) {
				return element.key == oNode.getKey();
			});
			this._selectedNode = oNode;
			this._pVDTSettingPopover.then(function(oPopover) {
				oPopover.openBy(oNode);
			});
		},

		onSettingShow: function(oEvent) {
			var oButton = oEvent.getSource(),
				oNode = oButton.getParent(),
				oView = this.getView(),
				oViewModel = this.getModel("viewData");

			var oNodeData = oView.getModel().getData().nodes.find(function(element) {
				return element.key == oNode.getKey();
			});

			var oNodeSetting = oViewModel.getData().nodeSetting;

			//Set Values For Node Setting
			oNodeSetting.title = oNodeData.title;

			oViewModel.setProperty("/nodeSetting", oNodeSetting);

			this._oDSC.setShowSideContent(true);
		},

		onSettingHide: function(oEvent) {
			this._oDSC.setShowSideContent(false);
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
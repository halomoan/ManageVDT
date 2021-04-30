sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbarButton",
	'sap/ui/core/Fragment',
	"sap/m/Popover"
], function(BaseController, JSONModel, OverflowToolbarButton, Fragment, Popover) {
	"use strict";


	return BaseController.extend("uol.bpc.ManageVDT.controller.App", {
		_formFragments: {},
		onInit: function() {

			this._oDSC = this.byId("DynamicSideContent");

			var oViewData = new JSONModel({
				nodeSetting: {
					mode: "new",
					title: "Node Setting",
					name: "RoomsRevenueHotel",
					formula: "#Formula1 + #Formula2",
					type: "0",
					dims: [{
						"Type": "Entity",
						"Name": "Entity",
						"Desc": "Company",
						"Value": "CC_2000 - PARKROYAL on Beach Road\r\nCC_2001 - PARKROYAL Kitchener"
					} ]
				},
				
				nodetypes: [
					{
						"key": "0",
						"text": "Formula"
					},
					{
						"key": "1",
						"text": "Baseline"
					},
					{
						"key": "2",
						"text": "Input"
					},
					{
						"key": "3",
						"text": "Calculation Group"
					},
					{
						"key": "4",
						"text": "Integrated"
					}
				]
			});

			var
				sModuleName = "uol/bpc/ManageVDT",
				oGraphModel = new JSONModel(sap.ui.require.toUrl(sModuleName + "/model/graph.json")),
				oDimListModel = new JSONModel(sap.ui.require.toUrl(sModuleName + "/model/dimList.json")),
				oView = this.getView(),
				oGraph = oView.byId("graph");

			oView.setModel(oGraphModel, "graphData");
			oView.setModel(oDimListModel, "dimlist");
			oView.setModel(oViewData, "viewData");

			oGraph.getToolbar().addContent(new OverflowToolbarButton({
				icon: "sap-icon://add",
				tooltip: "Add Node",
				type: "Transparent",
				press: this.onAddNewNode.bind(this)

			}));
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

			// var oData = oView.getModel().getData().nodes.find(function(element) {
			// 	return element.key == oNode.getKey();
			// });

			this._selectedNode = oNode;
			this._pVDTSettingPopover.then(function(oPopover) {
				oPopover.openBy(oNode);
			});
		},
		onSettingSave: function(oEvent) {
			var oView = this.getView(),
				oGraph = oView.byId("graph"),
				oGraphModel = this.getModel("graphData"),
				oGraphData = oGraphModel.getData(),
				oSettingData = this.getModel("viewData").getData().nodeSetting;

			var oParentData = oGraphData.nodes.find(function(ele) {
			 	return ele.name === oSettingData.name;
			 });
			
			if (oParentData){
				//Parent Node Exist
				var formula = oSettingData.formula;
				var arrFormula = formula.match(/\w+/g);
				
				var arrNewNode = [];
				for(var i = 0; i < arrFormula.length; i++ ){
					
					var isExist = oGraphData.nodes.some(function(ele) {
			 			return ele.name === arrFormula[i];
					});
					if (!isExist) {
						arrNewNode.push(arrFormula[i]);
					}
				}
				
				var iMaxKey = oGraphData.maxkey;
				var sStatus,sIcon,sType;
				sType = "Input"; sStatus = "Warning"; sIcon = "sap-icon://edit";
				
				/*switch(oSettingData.type){
					case "0": sType = "Formula"; sStatus = "Success"; sIcon = "sap-icon://fx" ; console.log('aneh'); break;
					case "1": sType = "Baseline"; sStatus = "Error"; sIcon = "sap-icon://edit" ; break;
					case "2": sType = "Input"; sStatus = "Warning"; sIcon = "sap-icon://edit"; break;
					case "3": sType = "Calc. Group"; sStatus = "Information"; sIcon = "sap-icon://edit"; break;
					case "4": sType = "Integrated"; sStatus = "Default"; sIcon = "sap-icon://edit"; break;
					default: sType = ""; sStatus = ""; sIcon = ""; break;
				}*/
				
				for(i = 0; i < arrNewNode.length; i++){
					var oNode = {
						"key": ++iMaxKey,
						"name": arrNewNode[i],
						"status": sStatus,
						"icon": sIcon,
						"formula" : "",
						"attributes": [
							{
								"label": "Type",
								"value": sType
							}
						]
					};	
					
					var oLine = {
							"from": oParentData.key ,
							"to": iMaxKey
					};
					
					oGraphData.nodes.push(oNode);
					oGraphData.lines.push(oLine);
				}
				
				oGraphData.maxkey = iMaxKey;
				oGraphModel.setProperty("/",oGraphData);
				
			} else {
				//New - Parent Node Not Exist
			}
		},
		onSettingShow: function(oEvent) {
			var oButton = oEvent.getSource(),
				oNode = oButton.getParent(),
				oViewModel = this.getModel("viewData");

			var oNodeData = this._getNodeData(oNode);

			var oNodeSetting = oViewModel.getData().nodeSetting;

			//Set Values For Node Setting
			oNodeSetting.title = oNodeData.title;

			oViewModel.setProperty("/nodeSetting", oNodeSetting);

			this._oDSC.setShowSideContent(true);
		},

		onSettingHide: function(oEvent) {
			this._oDSC.setShowSideContent(false);
		},

		onAddNewNode: function(oEvent) {
			var oViewModel = this.getModel("graphData"),
				oNodeSetting = oViewModel.getData().nodeSetting;

			//Set Values For Node Setting
			oNodeSetting.mode = "new";
			oNodeSetting.title = "New";
			oNodeSetting.name = "RoomsRevenueHotel";
			oNodeSetting.formula = "#ABC + #DEF";

			oViewModel.setProperty("/nodeSetting", oNodeSetting);

			this._oDSC.setShowSideContent(true);
		},

		onAddNode: function(oEvent) {
			var oButton = oEvent.getSource(),
				oNode = oButton.getParent(),
				oView = this.getView(),
				oViewModel = this.getModel("viewData");

			var oNodeData = this._getNodeData(oNode);

			console.log(oNodeData, oNode.getChildNodes());

			this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.VDTAddNode", this);
		},

		onToggleSideNavPress: function(oEvent) {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		onConfirmAddNode: function(oEvent) {
			this.byId("addNodeDialog").close();
		},
		onCancelAddNode: function(oEvent) {
			this.byId("addNodeDialog").close();
		},

		_getNodeData: function(oNode) {
			var oModel = this.getView().getModel();

			var sPath = oNode.getBindingContext().getPath();

			return oModel.getProperty(sPath);
			// var oData = oView.getModel().getData().nodes.find(function(element) {
			// 	return element.key == oNode.getKey();
			// });	

			// return oData;
		},

		_setToggleButtonTooltip: function(bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Expand');
			} else {
				oToggleButton.setTooltip('Collapse');
			}
		},

		onExit: function() {
			this.removeFragment(this._formFragments);
		}
	});
});
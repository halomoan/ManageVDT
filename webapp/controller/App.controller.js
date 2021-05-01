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
					dimlist: [{
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

		onPressNode: function(oEvent) {

			// var oNode = oEvent.getSource(),
			// 	oViewModel = this.getModel("viewData"),
			// 	oSettingData = oViewModel.getData().nodeSetting;
			
			// var oNodeData = this._getNodeData(oNode);
			
			// oSettingData.mode = "edit";
			// oSettingData.name = oNodeData.name;
			// oSettingData.formula = oNodeData.formula;
			// oSettingData.type = oNodeData.type;
			// oSettingData.dimlist = oNodeData.dimlist;
			
			// oViewModel.setProperty("/nodeSetting",oSettingData);

			var oNode = oEvent.getSource();
			this._oPopoverForNode = new Popover({
				title: oNode.getTitle(),
				placement: "Top"
			});
		
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


			if (!this._validateSetting(oSettingData)) {
				return;
			}
			
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
				var oNodeAttr = this._getNodeAttrByType("2");
				
				for(i = 0; i < arrNewNode.length; i++){
					var oNode = {
						"key": ++iMaxKey,
						"name": arrNewNode[i],
						"status": oNodeAttr.Status,
						"icon": oNodeAttr.Icon,
						"formula" : "",
						"type": oNodeAttr.Type, 
						"attributes": [
							{
								"label": "Type",
								"value": oNodeAttr.Text
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
				
				arrFormula = formula.match(/#\w+|[\*|\+|\-|\/]/g);
				var sFormula = "";
				for (i = 0; i< arrFormula.length; i++){
					if (i === 0) {
						sFormula = arrFormula[i];
					} else {
						sFormula = sFormula + " " + arrFormula[i];
					}
				}
			
				oNodeAttr = this._getNodeAttrByType(oSettingData.type);
				oParentData.type = oNodeAttr.Type;
				oParentData.attributes[0].value = oNodeAttr.Text;
				oParentData.status = oNodeAttr.Status;
				
				oParentData.formula = sFormula;
				oGraphData.maxkey = iMaxKey;
				
				oGraphModel.setProperty("/",oGraphData);
				
			} else {
				//New - Parent Node Not Exist
			}
		},
		onSettingShow: function(oEvent) {
			
			this._oDSC.setShowSideContent(true);
		},

		onSettingHide: function(oEvent) {
			this._oDSC.setShowSideContent(false);
		},

		onAddNewNode: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oNodeSetting = oViewModel.getData().nodeSetting;

			//Set Values For Node Setting
			oNodeSetting.mode = "new";
			oNodeSetting.title = "New Node";
			oNodeSetting.name = "";
			oNodeSetting.type = "0";
			oNodeSetting.dimlist = [];
			oNodeSetting.formula = "";

			oViewModel.setProperty("/nodeSetting", oNodeSetting);

			this._oDSC.setShowSideContent(true);
		},

		onEditNode: function(oEvent) {
			
			var oNode = oEvent.getSource(),
				oViewModel = this.getModel("viewData"),
				oSettingData = oViewModel.getData().nodeSetting;
			
			var oNodeData = this._getNodeData(oNode);
			
			oSettingData.mode = "edit";
			oSettingData.name = oNodeData.name;
			oSettingData.formula = oNodeData.formula;
			oSettingData.type = oNodeData.type;
			oSettingData.dimlist = oNodeData.dimlist;
			
			oViewModel.setProperty("/nodeSetting",oSettingData);

			this._validateSetting(oSettingData);
			
			this._oDSC.setShowSideContent(true);
			//this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.VDTAddNode", this);
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
		
		onFormulaChange: function(oEvent){
			var regex = new RegExp(/^#(\w)+(\s*[\+|\-|\*|\/]{1}\s*#(\w)+)*$/);
			var oSetFormula = oEvent.getSource();
			var sFormula = oEvent.getParameter('value');
			
			if (!regex.test(sFormula)) {
				
				oSetFormula.setValueState("Error");
			} else {
				oSetFormula.setValueState("None");
			}
			
		},
		
		_getNodeAttrByType: function(type){
			
			var oAttr = {
				Type: "2",
				Text: "Input",
				Status: "Defaut",
				Icon: "sap-icon://fx"
			};
			
			switch(type) {
				case "0": oAttr.Type = "0"; oAttr.Text = "Formula"; oAttr.Status = "Success"; oAttr.Icon = "sap-icon://fx"; break;
				case "1": oAttr.Type = "1"; oAttr.Text = "Baseline"; oAttr.Status = "Error"; oAttr.Icon = "sap-icon://edit"; break;
				case "2": oAttr.Type = "2"; oAttr.Text = "Input"; oAttr.Status = "Warning"; oAttr.Icon = "sap-icon://edit"; break;
				case "3": oAttr.Type = "3"; oAttr.Text = "Calculation Group"; oAttr.Status = "Information"; oAttr.Icon = "sap-icon://edit"; break;
				case "4": oAttr.Type = "4"; oAttr.Text = "Integrated"; oAttr.Status = "Default"; oAttr.Icon = "sap-icon://edit"; break;
			}
			
			return oAttr;
				
		},
		_validateSetting: function(oSettingData){
			var bIsValid = true;
			
			var regex = new RegExp(/^#(\w)+(\s*[\+|\-|\*|\/]{1}\s*#(\w)+)*$/);
			var oSetFormula = this.byId('SetFormula');
			
			if (!regex.test(oSettingData.formula)) {
				bIsValid = false;	
				oSetFormula.setValueState("Error");
			} else {
				oSetFormula.setValueState("None");
			}
			
			return bIsValid;
		},
		_getNodeData: function(oNode) {
			var oModel = this.getView().getModel("graphData");

			var sPath = oNode.getBindingContext("graphData").getPath();

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
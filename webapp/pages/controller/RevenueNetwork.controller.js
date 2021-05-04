sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/Popover",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, MessageBox, Popover, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.RevenueNetwork", {

		_FORMULATYPE: {
			formula: "0",
			baseline: "1",
			input: "2",
			calcgroup: "3",
			integrated: "4"
		},
		_DimIndex: 0,
		_DimMembers: null,
		_DimDefaultList: null,
		_formFragments: {},

		onInit: function() {

			this._oDSC = this.byId("DynamicSideContent");

			var oViewData = new JSONModel({
				nodeSetting: {
					mode: "new",
					key: 0,
					title: "Node Setting",
					name: "RoomsRevenueHotel",
					formula: "#Formula1 + #Formula2",
					type: "0",
					dimlist: [{
						"Type": "Entity",
						"Name": "ENTITY",
						"Desc": "Company",
						"Value": "CC_2000 - PARKROYAL on Beach Road\r\nCC_2001 - PARKROYAL Kitchener"
					}]
				},

				nodetypes: [{
					"key": "0",
					"text": "Formula"
				}, {
					"key": "1",
					"text": "Baseline"
				}, {
					"key": "2",
					"text": "Input"
				}, {
					"key": "3",
					"text": "Calculation Group"
				}, {
					"key": "4",
					"text": "Integrated"
				}]
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

			oGraph.getToolbar().addContent(new sap.m.OverflowToolbarButton({
				icon: "sap-icon://add",
				tooltip: "Add Node",
				type: "Transparent",
				press: this.onAddNewNode.bind(this)

			}));
			
			this.getOwnerComponent().getModel("odata").metadataLoaded().then(function() {
				var oOData = this.getModel("odata");
				var oThis = this;
				
				oOData.read("/DimensionSet", {
					success: function(oResult) {
						oThis._DimDefaultList = oResult.results;
					},
					error: function(oError) {
				
					}
				});
				
			}.bind(this));
			
			
			

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
		onOpenDimSelect: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oSettingData = oViewModel.getData().nodeSetting,
				oLink = oEvent.getSource(),
				sTarget = oLink.getTarget(),
				oView = this.getView();

			this._DimIndex = oLink.getId().match(/\d$/)[0];
			this._DimMembers = [];
			
			var sText = "" + oSettingData.dimlist[this._DimIndex].Value;

			var arrMembers = sText.split("\n");

			for (var i = 0; i < arrMembers.length; i++) {
				var arr = arrMembers[i].split(" - ");
				var sID = arr[0];
				this._DimMembers.push(sID);
			}

			this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.DimMemberSelector", this);

			// var oTree =  sap.ui.core.Fragment.byId(oView.getId(),"MstTree");
			// var oItemTemplate = new sap.m.StandardTreeItem({title:"{odata>Description}"});
			// oTree.bindAggregation("items", {
			// 	path: "odata>/DimensionSet('" + sTarget + "')/Members",
			// 	parameters: { useServersideApplicationFilters: false },
			// 	//parameters: { operationMode: 'Client', useServersideApplicationFilters: false },
			// 	events: { change: this.onTreeChange.bind(this) },
			// 	template: oItemTemplate,
			// 	templateShareable: false
			// });

			// oTree.bindItems("odata>/DimensionSet('" + sTarget + "')/Members",oItemTemplate);

		},

		onTreeFilter: function(oEvent) {
			var query = oEvent.getParameter("newValue").trim();

			this.byId("MstTree").getBinding("items").filter(query ? new Filter({
				filters: [
					new Filter("ID", FilterOperator.Contains, query),
					new Filter("Description", FilterOperator.Contains, query)
				],
				and: false
			}) : null);
		},

		onTreeChange: function(oEvent) {
			if (oEvent.getParameter("reason") == "filter") {

				var model = this.getModel("search");
				var query = model.getProperty("/query");

				this.byId("MstTree").expandToLevel(query ? 99 : 0);
			}
		},

		onSettingSave: function(oEvent) {
			var oView = this.getView(),
				oGraph = oView.byId("graph"),
				oGraphModel = this.getModel("graphData"),
				oGraphData = oGraphModel.getData(),
				oSettingData = this.getModel("viewData").getData().nodeSetting;

			var formula = oSettingData.formula,
				arrFormula,
				oNodeAttr,
				i = 0;

			var oValidation = this._validateSetting(oSettingData);
			if (!oValidation.success) {

				MessageBox.error(oValidation.msg);
				return;
			}

			var oParentData = oGraphData.nodes.find(function(ele) {
				return ele.name === oSettingData.name;
			});

			if (oParentData) {
				//Parent Node Exist

				oGraphData = this._deleteChildLink(oParentData.key, oGraphData);

				arrFormula = formula.match(/#\w+|[\*|\+|\-|\/]/g);
				var sFormula = "";
				for (i = 0; i < arrFormula.length; i++) {
					if (i === 0) {
						sFormula = arrFormula[i];
					} else {
						sFormula = sFormula + " " + arrFormula[i];
					}
				}

				//Update Selected (Parent) Node
				oNodeAttr = this._getNodeAttrByType(oSettingData.type);
				oParentData.type = oNodeAttr.Type;
				oParentData.attributes[0].value = oNodeAttr.Text;
				oParentData.status = oNodeAttr.Status;
				oParentData.formula = sFormula;

				if (oParentData.type !== this._FORMULATYPE.formula) {
					oGraphData = this._deleteChildLink(oParentData.key, oGraphData);
				}

				oGraphData = this._convertFormulaToNode(formula, oParentData, oGraphData);

			} else {
				//New - Parent Node Not Exist

				//oGraphData = this._addParentNode(oSettingData, oGraphData);

				oNodeAttr = this._getNodeAttrByType(oSettingData.type);
				oParentData = {
					"key": ++oGraphData.maxkey,
					"name": oSettingData.name,
					"status": oNodeAttr.Status,
					"icon": oNodeAttr.Icon,
					"formula": oSettingData.formula,
					"type": oNodeAttr.Type,
					"attributes": [{
						"label": "Type",
						"value": oNodeAttr.Text
					}]
				};

				oGraphData.nodes.push(oParentData);

				oGraphData = this._convertFormulaToNode(oSettingData.formula, oParentData, oGraphData);
			}

			oGraphModel.setProperty("/", oGraphData);
		},

	
		onSettingDelete: function(oEvent){
			
			var oThis = this,
				oGraphModel = this.getModel("graphData"),
				oGraphData = oGraphModel.getData(),
				oSettingData = this.getModel("viewData").getData().nodeSetting;
				
			MessageBox.confirm("Are you sure to remove node: " +  oSettingData.name + " ?", {
				actions: [MessageBox.Action.OK, "And Children Node", MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						
						oGraphData = oThis._deleteNode(oSettingData.key,false,oGraphData);
						sap.m.MessageToast.show("Successfully deleted : " + oSettingData.name + " only.");
						
					}else if(sAction === "And Children Node"){
						oGraphData = oThis._deleteNode(oSettingData.key,true,oGraphData);
						sap.m.MessageToast.show("Successfully deleted : " + oSettingData.name + " and related nodes.");
					}
					
					oGraphModel.setProperty("/", oGraphData);
					
				}
			});	
		},
		onSettingShow: function(oEvent) {

			this._oDSC.setShowSideContent(true);
		},

		onSettingHide: function(oEvent) {
			this._oDSC.setShowSideContent(false);
		},

		onAddNewNode: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oNodeSetting = oViewModel.getData().nodeSetting,
				oOData = this.getModel("odata");

		
			//Set Values For Node Setting
			oNodeSetting.mode = "new";
			oNodeSetting.key = 0;
			oNodeSetting.title = "New Node";
			oNodeSetting.name = "";
			oNodeSetting.type = "0";
			oNodeSetting.dimlist = this._DimDefaultList;
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
			oSettingData.title = "Edit Node";
			oSettingData.key = oNodeData.key;
			oSettingData.name = oNodeData.name;
			oSettingData.formula = oNodeData.formula;
			oSettingData.type = oNodeData.type;
			oSettingData.dimlist = oNodeData.dimlist;

			oViewModel.setProperty("/nodeSetting", oSettingData);

			this._validateSetting(oSettingData);

			this._oDSC.setShowSideContent(true);

		},

		onToggleSideNavPress: function(oEvent) {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		onOverWriteDimMember: function(oEvent) {
			var oTree = this.byId("MstTree"),
				oViewModel = this.getModel("viewData"),
				oSettingData = oViewModel.getData().nodeSetting;

			var arrItems = oTree.getSelectedItems();

			var sText = "";
			for (var i = 0; i < arrItems.length; i++) {
				var oItem = arrItems[i];

				if (i === 0) {
					sText = oItem.getTitle();
				} else {
					sText = sText + "\n" + oItem.getTitle();
				}
			}

			oSettingData.dimlist[this._DimIndex].Value = sText;

			oViewModel.setProperty("/nodeSetting", oSettingData);

			this.byId("addNodeDialog").close();
		},
		onAppendDimMember: function(oEvent){
			var oTree = this.byId("MstTree"),
				regex = new RegExp(/\n$/),
				oViewModel = this.getModel("viewData"),
				oSettingData = oViewModel.getData().nodeSetting;
				
			var arrItems = oTree.getSelectedItems();
			var sID = "", sText = "", sTemp,bExist;
			for (var i = 0; i < arrItems.length; i++) {
				var oItem = arrItems[i];
				sTemp = oItem.getTitle();
				sID = sTemp.split(" - ")[0];
				
				bExist = this._DimMembers.some(function(ele) {
					return ele === sID;
				});
				
				if (!bExist) {
					if (i === 0) {
						
						sText = oItem.getTitle();
						
					} else {
						sText = sText + "\n" + oItem.getTitle();
						
					}	
				}
			}
			
			if (oSettingData.dimlist[this._DimIndex].Value.length < 1 || regex.test(oSettingData.dimlist[this._DimIndex].Value)) {
				oSettingData.dimlist[this._DimIndex].Value += sText;
			} else {
				oSettingData.dimlist[this._DimIndex].Value += "\n" + sText;
			}
			oViewModel.setProperty("/nodeSetting", oSettingData);
			this.byId("addNodeDialog").close();
			
		},
		
		onCancelDimMember: function(oEvent) {
			this.byId("addNodeDialog").close();
		},

		onFormulaChange: function(oEvent) {
			var regex = new RegExp(/^#(\w)+(\s*[\+|\-|\*|\/]{1}\s*#(\w)+)*$/);
			var oSetFormula = oEvent.getSource();
			var sFormula = oEvent.getParameter('value');

			if (!regex.test(sFormula)) {

				oSetFormula.setValueState("Error");
			} else {
				oSetFormula.setValueState("None");
			}

		},

		_addNodeToGraph: function(oSettingData, oGraphData) {

			var iMaxKey = oGraphData.maxkey;

			var oNodeAttr = this._getNodeAttrByType(oSettingData.type);
			var oNode = {
				"key": ++iMaxKey,
				"name": oSettingData.name,
				"status": oNodeAttr.Status,
				"icon": oNodeAttr.Icon,
				"formula": oSettingData.formula,
				"type": oNodeAttr.Type,
				"attributes": [{
					"label": "Type",
					"value": oNodeAttr.Text
				}]
			};
			oGraphData.nodes.push(oNode);
			return oNode;
		},
		_addChildLink: function(parentKey, childKey, oGraphData) {
			var oLines = oGraphData.lines;
			var isLinkExist = oLines.some(function(ele) {
				return ele.to === childKey && ele.from === parentKey;
			});

			if (!isLinkExist) {
				var oLink = {
					from: parentKey,
					to: childKey
				};
				oLines.push(oLink);
			}
			return oGraphData;
		},
		
		_deleteParentLink: function(childKey, oGraphData) {
			var oLines = oGraphData.lines;

			for (var i = oLines.length - 1; i >= 0; i--) {
				if (oLines[i].to === childKey) {
					oLines.splice(i, 1);
				}
			}
			return oGraphData;

		},
		
		_deleteNode: function(childKey,recursive,oGraphData){
			var oLines = oGraphData.lines,
				oNodes = oGraphData.nodes;
			
			var arrKey = [ childKey ];
			
			var _getChildRec = function(key){
				for (var i = oLines.length - 1; i >= 0; i--) {
					if (oLines[i].from === key) {
						arrKey.push(oLines[i].to);
						_getChildRec(oLines[i].to);
					}
				}
				
			};
			
			if(recursive){
				_getChildRec(childKey);
			}
			
			var i, bDelete = false;
			
			for (i = oLines.length - 1; i >= 0; i--) {
				
				bDelete = arrKey.some(function(ele){
					return ele === oLines[i].from || ele === oLines[i].to;
				});
				
				if (bDelete){
					oLines.splice(i,1);
				}
			}
			
			for (i = oNodes.length - 1; i >= 0; i--) {
				
				bDelete = arrKey.some(function(ele){
					return ele === oNodes[i].key;
				});
				
				if (bDelete){
					oNodes.splice(i,1);
				}
			}
			
		
			
			return oGraphData;
		},
		
		_deleteChildLink: function(parentKey, oGraphData) {
			var oLines = oGraphData.lines;

			for (var i = oLines.length - 1; i >= 0; i--) {
				if (oLines[i].from === parentKey) {
					oLines.splice(i, 1);
				}
			}
			return oGraphData;

		},

		_getNodeAttrByType: function(type) {

			var oAttr = {
				Type: "2",
				Text: "Input",
				Status: "Defaut",
				Icon: "sap-icon://fx"
			};

			switch (type) {
				case "0":
					oAttr.Type = "0";
					oAttr.Text = "Formula";
					oAttr.Status = "Success";
					oAttr.Icon = "sap-icon://fx";
					break;
				case "1":
					oAttr.Type = "1";
					oAttr.Text = "Baseline";
					oAttr.Status = "Error";
					oAttr.Icon = "sap-icon://edit";
					break;
				case "2":
					oAttr.Type = "2";
					oAttr.Text = "Input";
					oAttr.Status = "Warning";
					oAttr.Icon = "sap-icon://edit";
					break;
				case "3":
					oAttr.Type = "3";
					oAttr.Text = "Calculation Group";
					oAttr.Status = "Information";
					oAttr.Icon = "sap-icon://edit";
					break;
				case "4":
					oAttr.Type = "4";
					oAttr.Text = "Integrated";
					oAttr.Status = "Default";
					oAttr.Icon = "sap-icon://edit";
					break;
			}

			return oAttr;

		},
		_validateSetting: function(oSettingData) {
			var oValidation = {
				success: true,
				msg: ""
			};

			if (oSettingData.type === this._FORMULATYPE.formula) {

				var regex = new RegExp(/^#(\w)+(\s*[\+|\-|\*|\/]{1}\s*#(\w)+)*$/);
				var oSetFormula = this.byId('SetFormula');

				if (!regex.test(oSettingData.formula)) {
					oValidation.success = false;
					oValidation.msg = "Detected Error In The Formula";
					oSetFormula.setValueState("Error");
				} else {
					oSetFormula.setValueState("None");
				}
			}

			return oValidation;
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
		
		_convertFormulaToNode: function(formula, oParentData, oGraphData) {

			if (oParentData.type !== this._FORMULATYPE.formula) {
				return oGraphData;
			}

			var arrFormula = formula.match(/\w+/g);

			var arrNewNode = [];
			for (var i = 0; i < arrFormula.length; i++) {

				var oChildData = oGraphData.nodes.find(function(ele) {
					return ele.name === arrFormula[i];
				});

				if (oChildData) {
					oGraphData = this._deleteParentLink(oChildData.key, oGraphData);
					oGraphData = this._addChildLink(oParentData.key, oChildData.key, oGraphData);
				} else {
					arrNewNode.push(arrFormula[i]);
				}
			}

			var oNodeAttr = this._getNodeAttrByType("2");

			for (i = 0; i < arrNewNode.length; i++) {
				var oNode = {
					"key": ++oGraphData.maxkey,
					"name": arrNewNode[i],
					"status": oNodeAttr.Status,
					"icon": oNodeAttr.Icon,
					"formula": "",
					"type": oNodeAttr.Type,
					"dimlist": JSON.parse(JSON.stringify(this._DimDefaultList)) ,
					"attributes": [{
						"label": "Type",
						"value": oNodeAttr.Text
					}]
				};

				var oLine = {
					"from": oParentData.key,
					"to": oGraphData.maxkey
				};

				oGraphData.nodes.push(oNode);
				oGraphData.lines.push(oLine);
			}

			return oGraphData;
		},
		onExit: function() {
			this.removeFragment(this._formFragments);
		}
	});

});
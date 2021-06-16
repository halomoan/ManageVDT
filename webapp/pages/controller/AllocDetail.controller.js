sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController,JSONModel, Filter, FilterOperator) {
	"use strict";
	
	var _TabParam,
		_DimDataRef,
		_DimIndex,
		_DimMembers;
	
	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.AllocDetail", {

		_IsSettingDirty: false,
		_formFragments: {},
		
		onInit: function() {
			var oViewData = {
				"isFullScreen" : false,
				"general": {
					"outdatasetdimlist": [
						{
							"Type": "Audit",
							"Name": "AUDIT_TRAIL",
							"Desc": "Audit Trail",
							"Value": "INPUT - INPUT"
						}
					],
					"versiondimlist": [
						{
							"Type": "Version",
							"Name": "VERSION",
							"Desc": "Version",
							"Value": "BUDGET - BUDGET"
						}
					],
					"dependency" : [
						{ "Id": "0", "Text" : "Dependency 1" },
						{ "Id": "1", "Text" : "Dependency 2" }
					]
				},
				"inputparam": {
					"dimlist": [
						{
							"ID": "ACCOUNT",
							"Name": "ACCOUNT",
							"Value": "P615011 - Room Revenue"
						},
						{
							"ID": "AUDIT",
							"Name": "AUDIT_TRAIL",
							"Value": "INPUT - INPUT"
						}
					],
					"isCumulative": true,
					"type": "byvalue",
					"factor": 1
				},
				"outputparam": {
					"dimlist": [
						{
							"ID": "ACCOUNT",
							"Name": "ACCOUNT",
							"Value": "P615011 - Room Revenue"
						},
						{
							"ID": "AUDIT",
							"Name": "AUDIT_TRAIL",
							"Value": "INPUT - INPUT"
						}
					],
					"swapInterco": false
				
				}
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
		
		onOpenDimSelect: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				oLink = oEvent.getSource(),
				sDataRef = oLink.data("dataref"),
				oView = this.getView();

			_DimIndex = oLink.getId().match(/\d$/)[0];
			
			_DimMembers = [];
			_DimDataRef = sDataRef;
			
			
			var dimlist;
			if (_DimDataRef === "inputparam") {
				dimlist = oViewData.inputparam.dimlist;	
			} else {
				dimlist = oViewData.outputparam.dimlist;	
			}
	
			
			var sText = dimlist[_DimIndex].Value;
		
			var arrMembers = sText.split("\n");

			for (var i = 0; i < arrMembers.length; i++) {
				var arr = arrMembers[i].split(" - ");
				var sID = arr[0];
				_DimMembers.push(sID);
			}
			
			this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.DimMemberSelector", this);
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
			if (oEvent.getParameter("reason") === "filter") {

				var model = this.getModel("search");
				var query = model.getProperty("/query");

				this.byId("MstTree").expandToLevel(query ? 99 : 0);
			}
		},
		
		onOverWriteDimMember: function(oEvent) {
			var oTree = this.byId("MstTree"),
				oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData();

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
			
			var dimlist;
			
			if (_DimDataRef === "inputparam") {
				dimlist = oViewData.inputparam.dimlist;	
			} else {
				dimlist = oViewData.outputparam.dimlist;	
			}
			
			
			
			dimlist[_DimIndex].Value = sText;
		
			oViewModel.setProperty("/" + _DimDataRef + "/dimlist", dimlist);

			this._IsSettingDirty = true;
			
			this.byId("addNodeDialog").close();
		},
		
		onAppendDimMember: function(oEvent){
			var oTree = this.byId("MstTree"),
				oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData();
				
			var arrItems = oTree.getSelectedItems();
			var sID = "", sText = "", sTemp,bExist;
			for (var i = 0; i < arrItems.length; i++) {
				var oItem = arrItems[i];
				sTemp = oItem.getTitle();
				sID = sTemp.split(" - ")[0];
				
				
				bExist = _DimMembers.some(function(ele) {
					return ele === sID;
				});
				
				if (!bExist) {
					if (sText.length < 1) {
						sText = oItem.getTitle();
					} else {
						sText = sText + "\n" + oItem.getTitle();
					}	
				}
			}
			
			var dimlist;
			
			if (_DimDataRef === "inputparam") {
				dimlist = oViewData.inputparam.dimlist;	
			} else {
				dimlist = oViewData.outputparam.dimlist;	
			}
			
			if (dimlist[_DimIndex].Value.length < 1 ) {
					dimlist[_DimIndex].Value += sText;
				} else {
					dimlist[_DimIndex].Value += "\n" + sText;
			}
				
		
		
			oViewModel.setProperty("/" + _DimDataRef + "/dimlist", dimlist);
			
			this._IsSettingDirty = true;
			this.byId("addNodeDialog").close();
			
		},
		
		onCancelDimMember: function(oEvent) {
			this.byId("addNodeDialog").close();
		},
		
		onSelectDimension: function(sParamId){
			var oView = this.getView();
			_TabParam = sParamId;
			this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.DimSelector", this);
		},
		
		onDimDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		
		onDimDialogClose: function(oEvent){
			var oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				oDimList;
				
			if (_TabParam === 'inputparam') {
				oDimList = oViewData.inputparam.dimlist;
			} else {
				oDimList = oViewData.outputparam.dimlist;		
			}	

				
			
			var aContexts = oEvent.getParameter("selectedContexts");
			
			if (aContexts && aContexts.length) {
				oDimList = [];
				for(var i = 0; i < aContexts.length ; i++ ){
					
					var oDim = aContexts[i].getObject();
					
					oDimList.push({ "ID" : oDim.ID, "Name": oDim.Name, "Value": oDim.Value});
					
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
			
			
			console.log(1,oViewData);
			
			var oSorter = new sap.ui.model.Sorter({
				    path: 'Name', 
				    descending: false});
			var oList;	    
			
			if (_TabParam === 'inputparam') {
				oViewModel.setProperty("/inputparam/dimlist", oDimList);
				// oList = sap.ui.getCore().byId("__component0---allocDetail--subAllocInput--inputdimlist");
				// console.log(oList);
				// oList.getBinding("items").refresh(true); 
				oViewModel.updateBindings();

			} else {
				oViewModel.setProperty("/outputparam/dimlist", oDimList);
				// oList = sap.ui.getCore().byId("__component0---allocDetail--subAllocOutput--outputdimlist");
				// console.log(oList);
				// oList.getBinding("items").refresh(true);
				oViewModel.updateBindings();
			}	
			
			console.log(2,oViewData);
			
			
		
		},
		onExit: function() {
			this.removeFragment(this._formFragments);
		}

	});

});
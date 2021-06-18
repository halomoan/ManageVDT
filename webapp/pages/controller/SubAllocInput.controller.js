sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController,JSONModel, Filter, FilterOperator) {
	"use strict";
	var _DimMembers,
		_DimIndex;

	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.SubAllocInput", {

		_formFragments: {},
		onInit: function() {
		
				var oViewData = {
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
				
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");
		},
		onSelectDimension: function(){
			var oView = this.getView();
			
			var abc = sap.ui.controller("uol.bpc.ManageVDT.pages.controller.FlexibleColumnLayout").getGlobalVar();
			
			console.log(abc);
			
			
			
			this.showFormDialogFragment(oView, this._formFragments, "uol.bpc.ManageVDT.fragments.DimSelector", this);
		},
		onDimDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		
		onDimMemberSelect: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				oView = this.getView(),
				oLink = oEvent.getSource(),
				dimlist = oViewData.dimlist;

			
			_DimIndex = oLink.getId().match(/\d$/)[0];
			_DimMembers = [];
			
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
			
			var dimlist = oViewData.dimlist;	
			
			dimlist[_DimIndex].Value = sText;
		
			oViewModel.setProperty("/dimlist", dimlist);

			//this._IsSettingDirty = true;
			
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
			
			var dimlist = oViewData.dimlist;	
			
			if (dimlist[_DimIndex].Value.length < 1 ) {
					dimlist[_DimIndex].Value += sText;
				} else {
					dimlist[_DimIndex].Value += "\n" + sText;
			}
				
		
		
			oViewModel.setProperty("/dimlist", dimlist);
			
			//this._IsSettingDirty = true;
			this.byId("addNodeDialog").close();
			
		},
		onCancelDimMember: function(oEvent) {
			this.byId("addNodeDialog").close();
		},
		onDimDialogClose: function(oEvent){
			var oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				oDimList = oViewData.dimlist;

			var aContexts = oEvent.getParameter("selectedContexts");
			
			if (aContexts && aContexts.length) {
				oDimList = [];
				for(var i = 0; i < aContexts.length ; i++ ){
					
					var oDim = aContexts[i].getObject();
					
					oDimList.push({ "ID" : oDim.ID, "Name": oDim.Name, "Value": oDim.Value});
					
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
			
			oViewModel.setProperty("/dimlist", oDimList);

		},
		onExit: function() {
			this.removeFragment(this._formFragments);
		}


	});

});
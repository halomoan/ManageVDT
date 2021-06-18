sap.ui.define([
	"uol/bpc/ManageVDT/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController,JSONModel, Filter, FilterOperator) {
	"use strict";
	var _DimMembers,
		_DimIndex,
		_DimDataRef;
		
	return BaseController.extend("uol.bpc.ManageVDT.pages.controller.SubAllocGeneral", {

		_formFragments: {},
		onInit: function() {
			var oViewData = {
				
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
						"Name": "VERSIOXN",
						"Desc": "Version",
						"Value": "BUDGET - BUDGET"
					}
				],
				"dependency" : [
					{ "Id": "0", "Text" : "Dependency 1" },
					{ "Id": "1", "Text" : "Dependency 2" }
				]
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");
		},
		
		onDimMemberSelect: function(oEvent) {
			var oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				oView = this.getView(),
				oLink = oEvent.getSource();
			
			_DimDataRef  = oLink.data("dataref");
			_DimIndex = oLink.getId().match(/\d$/)[0];
			_DimMembers = [];
			var dimlist = eval("oViewData." + _DimDataRef)
			
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
				oViewData = oViewModel.getData(),
				dimlist = eval("oViewData." + _DimDataRef);

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
			
			dimlist[_DimIndex].Value = sText;
		
			oViewModel.setProperty("/" + _DimDataRef, dimlist);

			//this._IsSettingDirty = true;
			
			this.byId("addNodeDialog").close();
		},
		
		onAppendDimMember: function(oEvent){
			var oTree = this.byId("MstTree"),
				oViewModel = this.getModel("viewData"),
				oViewData = oViewModel.getData(),
				dimlist = eval("oViewData." + _DimDataRef);

				
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
			
			if (dimlist[_DimIndex].Value.length < 1 ) {
					dimlist[_DimIndex].Value += sText;
				} else {
					dimlist[_DimIndex].Value += "\n" + sText;
			}
				
		
		
			oViewModel.setProperty("/" + _DimDataRef , dimlist);
			
			//this._IsSettingDirty = true;
			this.byId("addNodeDialog").close();
			
		},
		onCancelDimMember: function(oEvent) {
			this.byId("addNodeDialog").close();
		},

		onExit: function() {
			this.removeFragment(this._formFragments);
		}

	});

});
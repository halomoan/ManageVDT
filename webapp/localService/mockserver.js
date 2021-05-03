sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function(MockServer, Log) {
	"use strict";

	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			// create
			var oMockServer = new MockServer({
				rootUri: "/"
			});

			// simulate against the metadata and mock data
			oMockServer.simulate("./localService/metadata.xml", {
				sMockdataBaseUrl: "./localService/mockdata",
				bGenerateMissingMockData: true
			});
			
			// var fnBefore = function(oEvent){
			// 	console.log(oEvent);
					
			// };
			
			// var fnCustom = function(oEvent) {
			// 	var oXhr = oEvent.getParameter("oXhr");
			// 	//if (oXhr && oXhr.url.indexOf("first") > -1) {
			// 		oEvent.getParameter("oFilteredData").results.splice(0,2);
			// 	//}
			// };
			// oMockServer.attachBefore("GET", fnBefore, "DimensionSet");
			// oMockServer.attachAfter("GET", fnCustom, "DimensionSet");

			// start
			oMockServer.start();

			Log.info("Running the app with mock data");
		}

	};

});
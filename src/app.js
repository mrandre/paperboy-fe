define([
	'jquery',
	'bootstrap',
	'router',
	'backbone'
], function($, bootstrap, Router, Backbone) {

	var initialize = function() {

		$.ajaxSetup({
			async: true,
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true
		});
		$.support.cors = true;

		$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {

			if (jqXHR.status == "401" || jqXHR.status == "0" || jqXHR.status == "500") {
				var currRoute = Backbone.history.fragment;
				if (currRoute.indexOf("login") == -1) {
					var newRoute = "login";
					if (currRoute.length > 0) {
						newRoute += "?page=" + currRoute;
					}
					Backbone.history.navigate(newRoute, {
						trigger: true
					})
				}
			}
			$('#waiting').modal('hide');
		});

		Router.initialize();
	};


	return {
		initialize: initialize
	};
});

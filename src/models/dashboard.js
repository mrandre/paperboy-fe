define([
	'underscore',
	'backbone',
	'xdr'
], function(_, Backbone, xdr) {
	var Dashboard = Backbone.Model.extend({
		url: function() {
			return window.api_host + "dashboard/data";
		}
	});
	return Dashboard;
});

define([
	'underscore',
	'backbone',
	'xdr'
], function(_, Backbone, xdr) {
	var Auth = {
		Login: Backbone.Model.extend({
			defaults: {
				user: "",
				password: "",
				remember: false,
			},
			url: function() {
				return api_host + "auth/login";
			}
		}),
		Logout: Backbone.Model.extend({
			url: function() {
				return window.api_host + "auth/logout";
			}
		}),
		Current: Backbone.Model.extend({
			url: function() {
				return window.api_host + "auth/current";
			}
		})
	};

	return Auth;
});

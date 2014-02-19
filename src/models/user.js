define([
	'underscore',
	'backbone',
	'xdr'
], function(_, Backbone, xdr) {
    var User = {}
	User.UserDossier = Backbone.Model.extend({
		url: function() {
			return window.api_host + "user/info/" + this.id
		}
	});

    User.UserAlert = Backbone.Model.extend({
        url: function() {
            return window.api_host + "user/alert/" + this.id
        }
    });
	return User;
});

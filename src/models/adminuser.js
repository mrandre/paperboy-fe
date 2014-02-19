define([
	'backbone',
], function(Backbone) {
    var adminUserModels = {};

	adminUserModels.AdminUser = Backbone.Model.extend({
		url: function() {
			return window.api_host + "auth/user/" + this.id;
		}
	});

    adminUserModels.AdminUsers = Backbone.Collection.extend({
        model: adminUserModels.AdminUser,
        url: function() {
			return window.api_host + "auth/users";
        }
    });

    return adminUserModels;
});

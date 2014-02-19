define([
	'jquery',
	'underscore',
	'backbone',
	'xdr',
	'templates',
	'models/auth'
], function($, _, Backbone, xdr, templates, Auth) {

	var NavbarView = Backbone.View.extend({
		tagName: 'nav',
		id:"navbar-container",
		className:"navbar navbar-inverse navbar-fixed-top",
		attributes: {
			role:"navigation"
		},
		initialize: function() {
			var self = this;
			templates.fetch('navbar', function(templateData) {
				self.template = templateData;
				self.delegateEvents();
				self.render();
			});
		},
		render: function() {
			this.$el.html(this.template);
			var container = $("#navbar-container");
			if(container.length){
				container.html(this.el.html());
			} else{
				$('body').prepend(this.el);
			}
		},
		setNav: function(nav, authRequired) {
			this.$el.find('li.active').removeClass('active');
			this.$el.find('#' + nav + '-nav').addClass('active');

			if (authRequired) {
				var auth = new Auth.Current();
				var self = this;
				auth.fetch({
					success: function(data, response) {
						$('#login-ico').hide();
						$('#logout-ico').show();
						self.$el.find('#logout-ico a').attr('title', 'Logged in as ' + response.name + '. Click here to log out.');
					}
				});
			}
		}
	});

	return NavbarView;
});

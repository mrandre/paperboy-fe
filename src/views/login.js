define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'models/auth'
], function($, _, Backbone, templates, xdr, Auth) {

	var LoginView = Backbone.View.extend({
		tagName: 'div',
		initialize: function() {
			var self = this;
			templates.fetch('login', function(templateData) {
				self.template = templateData;
				self.delegateEvents();
				self.render();
			});
		},
		events: {
			'submit form': 'search'
		},
		render: function() {
			this.$el.html(this.template);
		},
		events: {
			"submit form": "login"
		},
		loginError: function() {
			this.$el.find('.error p').html("The password or username are incorrect. Please check your credentials and try again.");
			this.$el.find('.error').show();
		},
		login: function(e) {
			e.preventDefault();
			$('#waiting').modal({
				show: true,
				keyboard: false
			});
			var auth = new Auth.Login();
			var self = this;
			auth.save({
				user: this.$el.find("#user_id").val(),
				password: this.$el.find("#password").val(),
				remember: (this.$el.find('#remember').val() == "true")
			}, {
				success: function(data, response) {
					if (response.result == "success") {
						$('#logout-ico').show();
						$('#login-ico').hide();

						if (!self.forward) {
							self.forward = '';
						}
						// dashboard by default!
						Backbone.history.navigate(self.forward, {
							trigger: true
						});
					} else {
						self.loginError();
					}
					$('#waiting').modal('hide');
				},
				error: function(data, response) {
					self.loginError();
					$('#waiting').modal('hide');
				}
			});
		},
		logout: function() {
			var logout = new Auth.Logout();
			logout.fetch({
				complete: function(data, response) {
					$('#logout-ico').hide();
					$('#login-ico').show();
					Backbone.history.navigate('login', {
						trigger: true
					});
				}
			});
		}
	});

	return LoginView;
});

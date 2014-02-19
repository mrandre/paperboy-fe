define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'xdr'
], function($, _, Backbone, templates, xdr) {

	var HomeView = Backbone.View.extend({
		tagName: 'div',
		initialize: function() {
			var self = this;
			templates.render('users', {
				'id': ''
			}, function(templateData) {
				self.template = templateData;
				self.render();
				self.delegateEvents();
			});
		},

		events: {
			'submit form': 'search'
		},

		// render library by rendering each book in its collection
		render: function() {
			this.$el.html(this.template);
		},

		search: function(e) {
			e.preventDefault();
			var q = $('#query');
			var query = q.val();

			if (query.length) {
				q.blur();
				Backbone.history.navigate('users/user/' + query, {
					trigger: true
				})
			} else {
				alert('Please enter a valid search query');
			}
		}

	});

	return HomeView;
});

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'xdr'
], function($, _, Backbone, templates, xdr) {

	var articleSearchViews = {};

	articleSearchViews.SearchView = Backbone.View.extend({
		tagName: 'div',
		initialize: function(results, callback) {
			var self = this;
			this.results = results;
			$('#waiting').modal('show');
			templates.fetch('article/search', function(templateData) {
				self.$el.html(templateData);
				self.render();
				self.delegateEvents();
				callback(self.el);
			});
		},

		events: {
			'submit form': 'search'
		},

		search: function(e) {
			e.preventDefault();

			var query = this.$el.find('#query').val();

			if (query.length) {
				Backbone.history.navigate('articles/search/' + query, {
					trigger: true
				});
			} else {
				alert('Please enter a valid query.');
			}

		},

		render: function() {
			var self = this;
			if (this.results.query) {
				this.$el.find('#query').val(this.results.query);

				this.results.fetch({
					reset: true
				}).complete(function() {
					var found = false;

					//preload list template
					templates.fetch(articleSearchViews.SearchResultViewTemplateName, function() {
						self.results.each(function(result) {
							if (result.attributes.results) {
								_.each(result.attributes.results, function(sresult) {
									found = true;
									self.renderSearchResult({
										type: result.attributes.type,
										value: sresult
									});
								});
							}
						});

						if (!found) {
							self.$el.find('#searchResults').hide();
							self.$el.find('.welcome').hide();
							self.$el.find('.error').show();
						} else {
							self.$el.find('#searchResults').show();
						}

						$('#waiting').modal('hide');
					});

				});

			} else {
				$('#waiting').modal('hide');
			}
		},

		renderSearchResult: function(result) {
			var view = new articleSearchViews.SearchResultView({
				model: result
			});
			$(this.$el.find('.result-list')).append(view.render());
		}

	});

	articleSearchViews.SearchResultViewTemplateName = 'article/searchResultTemplate';
	articleSearchViews.SearchResultView = Backbone.View.extend({
		tagName: 'p',

		render: function() {
			var templateData = templates.cache[articleSearchViews.SearchResultViewTemplateName](this.model);
			this.$el.html(templateData);
			return this.el;
		}
	});

	return articleSearchViews;
});

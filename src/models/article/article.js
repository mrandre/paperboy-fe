define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'xdr'
], function($, bootstrap, _, Backbone, xdr) {
	var articleModels = {};

	articleModels.Article = Backbone.Model.extend({
		url: function() {
			var articleParam = 'articles/article?url=' + this.id;

			var url = window.api_host + articleParam;
			return window.AddGetSortParam(url);
		}
	});

	articleModels.ArticleSummary = Backbone.Model.extend({});

	articleModels.ArticleSummaries = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.timeframe = options.timeframe;
			if ('all' in options) {
				this.all = options.all;
			} else {
				this.all = false;
			}
		},
		url: function() {
			var loc = window.api_host + 'articles/articles/' + this.timeframe;
			if (this.all) {
				loc += '?all=true';
			}
			return window.AddGetSortParam(loc);
		},

		model: articleModels.ArticleSummary
	});

	return articleModels;
});

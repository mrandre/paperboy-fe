define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'xdr'
], function($, bootstrap, _, Backbone, xdr) {
	var blogModels = {};

	blogModels.BlogInfo = Backbone.Model.extend({
		url: function() {
			var loc = window.api_host + 'articles/blog/' + this.id + '?timeframe=' + this.attributes.timeframe;
			return window.AddGetSortParam(loc);
		}
	});

	blogModels.BlogSummary = Backbone.Model.extend({});

	blogModels.BlogSummaries = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.timeframe = options.timeframe;
			if ('all' in options) {
				this.all = options.all;
			} else {
				this.all = false;
			}
		},
		url: function() {
			var loc = window.api_host + 'articles/blogs/' + this.timeframe;
			if (this.all) {
				loc += '?all=true';
			}
			return window.AddGetSortParam(loc);
		},

		model: blogModels.BlogSummary
	});

	return blogModels;
});

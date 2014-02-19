define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'xdr'
], function($, bootstrap, _, Backbone, xdr) {
	var authorModels = {};

	authorModels.AuthorInfo = Backbone.Model.extend({
		url: function() {
			var loc = window.api_host + 'articles/author/' + this.id + '?timeframe=' + this.attributes.timeframe;
			return window.AddGetSortParam(loc);
		}
	});
	
	authorModels.AuthorSummary = Backbone.Model.extend({});
	authorModels.AuthorNewsletterSummary = Backbone.Model.extend({});

	authorModels.AuthorSummaries = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.timeframe = options.timeframe;
			if ('all' in options) {
				this.all = options.all;
			} else {
				this.all = false;
			}
		},
		url: function() {
			var loc = window.api_host + 'articles/authors/' + this.timeframe;
			if (this.all) {
				loc += '?all=true';
			}
			return window.AddGetSortParam(loc);
		},
		model: authorModels.AuthorSummary
	});


	return authorModels;
});

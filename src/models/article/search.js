define([
	'jquery',
	'backbone',
	'xdr'
], function($, Backbone, xdr) {
	var articleSearchModels = {};

	articleSearchModels.SearchResult = Backbone.Model.extend({});

	articleSearchModels.SearchResults = Backbone.Collection.extend({
		initialize: function(query) {
			this.query = query;
		},
		url: function() {
			return window.api_host + 'articles/search/' + this.query;
		},
		model: articleSearchModels.SearchResult
	});
	
	return articleSearchModels;
});

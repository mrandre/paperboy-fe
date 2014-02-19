define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'xdr'
], function($, bootstrap, _, Backbone, xdr) {
	var sectionModels = {};

	sectionModels.SectionInfo = Backbone.Model.extend({
		url: function() {
			var loc = api_host + 'articles/section/' + this.id + '?timeframe=' + this.attributes.timeframe;
			return window.AddGetSortParam(loc);
		}
	});

	sectionModels.SectionSummary = Backbone.Model.extend({});

	sectionModels.SectionSummaries = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.timeframe = options.timeframe;
			if ('all' in options) {
				this.all = options.all;
			} else {
				this.all = false;
			}
		},
		url: function() {
			var loc = api_host + 'articles/sections/' + this.timeframe;
			if (this.all) {
				loc += '?all=true';
			}
			return window.AddGetSortParam(loc);
		},

		model: sectionModels.SectionSummary
	});

	return sectionModels;
});

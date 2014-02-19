define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'xdr'
], function($, bootstrap, _, Backbone, xdr) {
	var newsletterModels = {};
	
	newsletterModels.NewsletterInfo = Backbone.Model.extend({
		url: function(){        
	        var loc = window.api_host + 'articles/newsletter/' + this.id + '?timeframe=' + this.attributes.timeframe;
			return window.AddGetSortParam(loc);
		}
	});

	newsletterModels.NewsletterSummary = Backbone.Model.extend({});

	newsletterModels.NewsletterSummaries = Backbone.Collection.extend({
	    initialize: function (models, options) {
	        this.timeframe = options.timeframe;
	        if ('all' in options) {
	            this.all = options.all;
	        } else {
	            this.all = false;
	        }
	    },
	    url: function () {
	        var loc = window.api_host + 'articles/newsletters/' + this.timeframe;
	        if (this.all) {
	            loc += '?all=true';
	        }
			return window.AddGetSortParam(loc);
	    },

	    model: newsletterModels.NewsletterSummary
	});
	
	return newsletterModels;
});



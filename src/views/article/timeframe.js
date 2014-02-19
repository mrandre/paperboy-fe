define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr'
], function($, bootstrap, _, Backbone, templates, xdr) {

	var ArticleTimeframeView = Backbone.View.extend({
		tagName: 'div',

		initialize: function() {
		},

		render: function(callback) {
			var self = this;
			templates.fetch('article/timeframe', function(templateData) {
				self.$el.html(templateData);
				self.delegateEvents();
				callback();
			});
		},

		events: {
			"change #timeframe": "timeframeChange",
			"change #sort": "sortChange"
		},

		getAndSetTimeframe: function() {
			var url = document.location.href.split('#');
			var timeframe = ""
			if (url.length > 1) {
				timeframe = url[1].split('?')[0];
			}
			
			var found = false;
			this.$el.find('#timeframe option').each(function(opt) {
				if (timeframe.indexOf(this.value) != -1) {
					found = true
					timeframe = this.value;
					return;
				}
			});

			if (!timeframe || !found) {
				timeframe = $('#timeframe').val();
			}

			if (timeframe && (this.$el.find('#timeframe').val() != timeframe)) {
				this.$el.find('#timeframe').val(timeframe);
			}

			var currSort = "";
			var sortFound = false;
			this.$el.find('#sort option').each(function(opt) {
				if (document.location.href.indexOf(this.value) != -1) {
					sortFound = true
					currSort = this.value;
					return;
				}
			});

			if (sortFound) {
				this.$el.find('#sort').val(currSort);
			}

			if (!timeframe) {
				timeframe = "1week";
			}

			return timeframe;
		},

		timeframeChange: function() {
			var timeframe = this.$el.find('#timeframe').val();
			var url = document.location.href.split('#');
			var loc = ""
			if (url.length > 1) {
				loc = url[1];
			}
			var found = false;
			this.$el.find('#timeframe option').each(function(opt) {
				if (loc.indexOf(this.value) != -1) {
					found = true
					loc = loc.replace(this.value, timeframe);
					return;
				}
			});

			if (!found) {
				var locData = [loc];
				if (loc.indexOf('?') != -1) {
					locData = loc.split('?');
					locData[1] = '?' + locData[1];
				}
				if(_.last(locData[0]) != "/"){
					locData[0] += "/";
				}
				locData[0] +=  timeframe;

				loc = locData.join('');
			}

			Backbone.history.navigate(loc, {
				trigger: true
			});
		},

		sortChange: function() {
			//reload the data to pull new sort!
			var sort = this.$el.find('#sort').val();
			var url = document.location.href.split('#');
			var loc = ""
			if (url.length > 1) {
				loc = url[1];
			}

			var found = false;
			this.$el.find('#sort option').each(function(opt) {
				if (loc.indexOf(this.value) != -1) {
					found = true
					loc = loc.replace(this.value, sort);
					return;
				}
			});

			if (!found) {

				if (loc.indexOf('?') == -1) {
					loc = loc + '?';
				} else {
					loc = loc + '&';
				}

				loc = loc + 'sort=' + sort;
			}
			Backbone.history.navigate(loc, {
				trigger: true
			});
		}

	});
	return ArticleTimeframeView;
});

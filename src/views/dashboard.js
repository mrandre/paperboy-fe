define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'highcharts',
	'templates',
	'qtip',
	'xdr'
], function($, bootstrap, _, Backbone, highcharts, templates, qtip, xdr) {

	var DashboardView = Backbone.View.extend({
		tagName: 'div',
		initialize: function(dashboard) {
			this.dashboard = dashboard;
			this.delegateEvents();
			this.render();
		},
		events: {},
		render: function() {
			var self = this;
			$('#waiting').modal({
				show: true,
				keyboard: false
			});

			this.$el.find('.has-tip').qtip({
				style: 'qtip-bootstrap'
			});

			this.dashboard.fetch({
				reset: true,
				success: function() {
					templates.render('dashboard', self.dashboard.attributes, function(templateData) {
						self.$el.html(templateData);
						self.renderDeliveryCharts(self.dashboard.attributes.delivery);

						$('.has-tip').qtip({
							style: 'qtip-bootstrap'
						});
						$('#waiting').modal('hide');
					});

				}
			})
		},

		renderDeliveryCharts: function(deliveryStats) {
			this.$el.find('#todays-sent-pie').highcharts({
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				credits: {
					enabled: false
				},
				title: {
					text: ''
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						colors: ['#468847', '#b94a48'],
						dataLabels: {
							enabled: true,
							color: '#000000',
							connectorColor: '#000000',
							format: '<b>{point.name}</b>: {point.percentage:.1f} %'
						}
					}
				},
				series: [{
					type: 'pie',
					name: 'Today',
					data: [
						['Delivered', deliveryStats.today.delivered],
						['Bounced', deliveryStats.today.bounced]
					]
				}]
			});

			this.$el.find('#30day-sent-pie').highcharts({
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				credits: {
					enabled: false
				},
				title: {
					text: ''
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						colors: ['#468847', '#b94a48'],
						dataLabels: {
							enabled: true,
							color: '#000000',
							connectorColor: '#000000',
							format: '<b>{point.name}</b>: {point.percentage:.1f} %'
						}
					}
				},
				series: [{
					type: 'pie',
					name: 'Last 30 Days',
					data: [
						['Delivered', deliveryStats.thirty_days.delivered],
						['Bounced', deliveryStats.thirty_days.bounced]
					]
				}]
			});

			this.$el.find('#ytd-sent-pie').highcharts({
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				credits: {
					enabled: false
				},
				title: {
					text: ''
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						colors: ['#468847', '#b94a48'],
						dataLabels: {
							enabled: true,
							color: '#000000',
							connectorColor: '#000000',
							format: '<b>{point.name}</b>: {point.percentage:.1f} %'
						}
					}
				},
				series: [{
					type: 'pie',
					name: 'YTD',
					data: [
						['Delivered', deliveryStats.ytd.delivered],
						['Bounced', deliveryStats.ytd.bounced]
					]
				}]
			});
		}
	});

	return DashboardView;
});

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'xdr',
    'select2',
    'datepicker',
    'highcharts',
    'datatables',
    'tabletools',
    'zeroclipboard',
    'chartExport',
], function($, _, Backbone, templates, xdr, select2, datepicker, 
            highcharts, datatables, tabletools, zeroclipboard, chardExport) {

	var SubscriptionsByProdView = Backbone.View.extend({
		tagName: 'div',
        className: 'col-lg-12 col-md-12',
		initialize: function(emailProducts, subsciptions, productCodes, start, end) {
			var self = this;
           
            this.products = emailProducts;
            this.subscriptions = subsciptions;
            this.start = start;
            this.end = end;
            this.productCodes = productCodes;

            if(!this.start){
                this.start = window.formatFormDate(new Date());
            }

            self.render();    
		},

		events: {
			'submit form': 'runReport',
            'click .toggle-form': 'toggleForm'
        },

        toggleForm: function(e) {
            $('.toggle-form').toggle();
            $('.form-container').collapse('toggle');
        },

		render: function() {
            var self = this;
            var renderReport = function(){
                templates.render(
                    'report/subsByProd',
                    {
                        'products':self.products,
                        'start':self.start,
                        'end':self.end,
                        'productCodes':self.productCodes,
                        'results':self.subscriptions
                    }, 
                    function(template){
                        self.$el.html(template);
                        self.$el.find('#productCode').select2({
                            placeholder:"SELECT A PRODUCT",   
                            allowClear: true,
                            width:"element"
                        });
                        self.$el.find('#startDate').datepicker({
                            format: "yyyy-mm-dd",
                            autoclose: true,
                            startDate:new Date(2011,3,15),
                            endDate:new Date()
                        });
                        self.$el.find('#endDate').datepicker({
                            format: "yyyy-mm-dd",
                            autoclose: true,
                            startDate:new Date(2011,3,15),
                            endDate:new Date()
                        });

                        if(self.subscriptions.length){
                            self.renderChart();
                            self.createDatatable();
                        }
                        $('#waiting').modal('hide');
                });
            };
            
            if(this.start && 
                    this.productCodes) {
                if(!this.end){
                    this.end = this.start;
                }
                $('#waiting').modal('show');
                this.subscriptions.fetch({
                    reset: true
                }).complete(function() {
                    renderReport();
                }); 
            }
            else {
                renderReport();
            }
		},
        
        createDatatable: function() {
            this.$el.find('#result-list table').show();
            this.$el.find('#result-list table').dataTable({
                "sDom": 'T',
                "bInfo": false,
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": false,
                "bSort": false,
                "oTableTools": {
                    "sSwfPath": window.version + "/swf/vendor/copy_csv_xls_pdf.swf"
                }
            });
        },

        renderChart: function() {
            var self = this;
            var prodNames = {};
            _.each(self.productCodes,function(code){
                prodNames[code] = self.products.getName(code);
            });
            
            $('#result-chart').show();
            var daySet = {};
            var prodSet
            var prodSeries = {};
            _.each(self.subscriptions.models, function(sub){
                day = sub.attributes.date.split("T")[0];
                daySet[day] = 1;
                if(!(day in prodSeries)){
                    prodSeries[day] = {};
                }
                prodSeries[day][sub.attributes.product] = sub.attributes.count;
            });
            var days = [];
            for(day in daySet){ days.push(day); }
            days.reverse();
            var series = [];
            for(code in prodNames){
                series.push({name:prodNames[code].replace('&#39;',"'"),data:[],code:code});
            }
            _.each(days,function(day){
                _.each(series,function(s){
                    var count = prodSeries[day][s.code];
                    if(!count){
                        count = 0;
                    }
                    s.data.push(count);
                });
            });

            var title = "";
            var j = 0;
            self.productCodes.sort();
            _.each(self.productCodes,function(code){
                title += code;
                if(j < self.productCodes.length - 2){
                    title += ", ";
                }
                else if(j == self.productCodes.length - 2) {
                    title += " and ";
                }
                j++;
            });

            title += " from " + self.start + " to " + self.end;

            self.$el.find('#result-chart').highcharts({
                title: {
                    text:title
                },
                yAxis: {
                    title: {
                        text:'Subscribers'
                    },
                    min:0
                },
                xAxis: {
                title: {
                    text:'Time'
                },
                labels: {
                    enabled:false
                        },
                        categories: days
                    },
                legend:{
                    //enabled:false
                },
                credits:{enabled:false},
                series:series
            });

        },

		runReport: function(e) {
			e.preventDefault();
			var start = $('#startDate').val();
            var end = $('#endDate').val();
            if(end.length){
                end = "/"+end;
            }
            var prod = $('#productCode').val(); 
			Backbone.history.navigate('report/subscriptions/product/'+prod+'/'+start+end, {
				trigger: true
			});
		}

	});

	return SubscriptionsByProdView;
});

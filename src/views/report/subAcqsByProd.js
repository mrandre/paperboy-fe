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

	var SubscriptionAcquisitionsView = Backbone.View.extend({
		tagName: 'div',
        className: 'col-lg-12 col-md-12',
		initialize: function(emailProducts, subsciptions, productCodes, interval, start, end) {
			var self = this;
           
            this.products = emailProducts;
            this.subscriptions = subsciptions;
            this.interval = interval;
            this.start = start;
            this.end = end;
            this.productCodes = productCodes;

            if(!this.start){
                var t = new Date();
                t = new Date(t.getFullYear(), t.getMonth()-1, t.getDate()+1); 
                this.start = window.formatFormDate(t);
                this.end = window.formatFormDate(new Date());
            }
            
            self.render();
		},

		events: {
			'submit #reportForm': 'runReport',
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
                    'report/subsAcqByProd',
                    {
                        'products':self.products,
                        'interval':self.interval,
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
                        self.$el.find('.btn').button();
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
            var intervalSet = {};
            var prodSeries = {};
            _.each(self.subscriptions.models, function(sub){
                var startDay = window.formatDate(sub.attributes.start_date);
                var endDay = window.formatDate(sub.attributes.end_date);
                var interval = startDay+" to "+endDay;
                intervalSet[interval] = 1;
                if(!(interval in prodSeries)){
                    prodSeries[interval] = {};
                }
                var label = " (gain)";
                prodSeries[interval][sub.attributes.product] = sub.attributes.start;
                if(sub.attributes.diff < 0){
                    label =" (loss)";
                    prodSeries[interval][sub.attributes.product] = sub.attributes.end;
                }
                prodSeries[interval][sub.attributes.product+label] = Math.abs(sub.attributes.diff);
            });
            var intervals = [];
            for(interval in intervalSet){ intervals.push(interval); }
            var series = [];
            for(code in prodNames){
                var name = prodNames[code].replace('&#39;',"'") + " ("+code+")";
                series.push({linkedTo:code,stack:code,name:name +" - GAIN",data:[],code:code+" (gain)",label:"gain",color:'#468847'});
                series.push({linkedTo:code,stack:code,name:name +" - LOSS",data:[],loss:1,code:code+" (loss)",label:"loss",color:'#b94a48'});
                series.push({id:code,stack:code,name:name,data:[],code:code});
            }
            _.each(intervals,function(interval){
                _.each(series,function(s){
                    var count = prodSeries[interval][s.code];
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
                chart: {
                    type:'column'
                },
                plotOptions: {
                    column: {
                        stacking:'normal'
                    }
                },
                colors: window.altChartColors, 
                tooltip: {
                    formatter: function() {
                        var num = this.y;
                        if('loss' in this.series.options){
                            num = -num;
                        }
                        return '<b>'+ this.x +'</b><br/>'+
                            this.series.options.name +': '+ window.numberWithCommas(num) +'<br/>';
                    }
                },
                title: {
                    text:title
                },
                yAxis: {
                    title: {
                        text:'Subscribers'
                    },
                    min:0,
                    allowDecimals: false
                },
                xAxis: {
                    categories: intervals 
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
            if(!prod) {
                alert('please select an Email Product');
                return;
            }
            var interval = this.$el.find('input[name=interval]:checked').val();
			Backbone.history.navigate('report/subscriptions/acquisition/'+prod+'/'+interval+'/'+start+end, {
				trigger: true
			});
		}

	});

	return SubscriptionAcquisitionsView;
});

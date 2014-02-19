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
            highcharts, datatables, tabletools, zeroclipboard, chartExport) {

	var TransPerformanceReportView = Backbone.View.extend({
		tagName: 'div',
        className: 'col-lg-12 col-md-12',
		initialize: function(emailTypes, campaignTypes, results, type, query, start, end, totalsOnly) {
			var self = this;
            this.campaignTypes = campaignTypes; 
            this.emailTypes = emailTypes;
            this.results = results;
            this.type = type;
            this.query = query;
            this.start = start;
            this.end = end;
            this.totalsOnly = totalsOnly;

            if(!this.start){
                var t = new Date();
                t = new Date(t.getFullYear(), t.getMonth(), t.getDate()-1); 
                this.start = window.formatFormDate(t);
                this.end = window.formatFormDate(new Date());
            }

            self.render();
		},

		events: {
			'submit #reportForm': 'runReport',
            'click .toggle-form': 'toggleForm',
            'change input[type=radio]': 'toggleType',
            'change input[type=checkbox].toggle-cols': 'toggleColumnGroup',
            'change input[type=checkbox].toggle-chart': 'renderChart'
		},

        toggleForm: function(e) {
            $('.toggle-form').toggle();
            $('.form-container').collapse('toggle');
        },

        toggleType: function(e) {
            var target = $(e.currentTarget);
            switch(target.val()){
            case 'email-type':
                this.$el.find('#email-type-field').show();
                this.$el.find('#campaign-type-field').hide();
                break;
            case 'campaign-type':
                this.$el.find('#campaign-type-field').show();
                this.$el.find('#email-type-field').hide();
                break;
            case 'none':
                this.$el.find('#email-type-field').hide();
                this.$el.find('#campaign-type-field').hide();
                break;
            }
        },

		render: function() {
            var self = this;
            var renderReport = function(){
                templates.render(
                    'report/transPerformance',
                    {
                        'emailTypes':self.emailTypes,
                        'campaignTypes':self.campaignTypes,
                        'type':self.type,
                        'query':self.query,
                        'start':self.start,
                        'end':self.end,
                        'totalsOnly':self.totalsOnly,
                        'results':self.results
                    }, 
                    function(template){
                        self.$el.html(template);
                        self.$el.find('#emailType').select2({
                            placeholder:"SELECT AN EMAIL TYPE",   
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

                        if(self.results.attributes.instances){
                            self.createDatatable();
                        }
                        $('#waiting').modal('hide');
                });
            };
            
            if(this.start && 
                    this.end &&
                    this.type) {
                $('#waiting').modal('show');
                this.results.fetch({
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
            //this.$el.find('#result-table').show();
            this.$el.find('#result-table').dataTable({
                "sDom": 'T',
                "bInfo": false,
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": false,
                "sScrollX": "30%",
                "sScrollXInner": "120%",
                "bScrollCollapse": true,
                "bSort": false,
                "oTableTools": {
                    "sSwfPath": window.version + "/swf/vendor/copy_csv_xls_pdf.swf"
                },
                "aoColumns": [ 
                        null,
                        null,
                        {"bVisible": false},
                        null,
                        null,
                        {"bVisible": false},
                        {"bVisible": false},
                        {"bVisible": false},
                        {"bVisible": false},
                        {"bVisible": false},
                        null,
                        {"bVisible": false},
                        null,
                        {"bVisible": false},
                        {"bVisible": false},
                        {"bVisible": false},
                        {"bVisible": false}
                ] 
            });
        },

        renderChart: function() {
            var self = this;
            var types = {};
            var chartType = $('.toggle-chart:checked');
            _.each(chartType, function(t){
                types[t.value] = 1;
                switch(t.value){
                case 'delivery':
                    self.renderDeliveryChart();
                    break;
                case 'clicks':
                    self.renderClicksChart();
                    break;
                case 'opens':
                    self.renderOpensChart();
                    break;
                case 'ctr':
                    self.renderCTRChart();
                    break;
                case 'cto':
                    self.renderCTOChart();
                    break;
                case 'openrate':
                    self.renderOpenRateChart();
                    break;
                }
            });
            var charts = ['delivery','openrate','opens','clicks','ctr','cto'];
            _.each(charts, function(c){
                if(!(c in types)){
                    self.$el.find('#'+c+'-chart').hide(); 
                } 
            });
            $('.highlight-row').removeClass('highlight-row');
        },

        buildTitle: function(name, types){
            var title = name + ": ";
            var j = 0;
            types.sort();
            _.each(types,function(code){
                title += code;
                if(j < types.length - 2){
                    title += ", ";
                }
                else if(j == types.length - 2) {
                    title += " and ";
                }
                j++;
            });

            title += " from " + this.start + " to " + this.end;
            return title;
        },
        
        scrollToRow: function(id){
            var row = this.$el.find('#'+id);
            var rownum = row.data('row');
            var tOffset = this.$el.find('#result-list table tr:eq('+rownum+')').offset().top;

            $('body, html').animate({
                scrollTop: tOffset - 100
            }, 500);

            $('.highlight-row').removeClass('highlight-row');
            row.addClass('highlight-row');
        },

        renderCTRChart: function() {
            this.renderLineChart('ctr','Click Through Rate By Day', '%');
        },

        renderCTOChart: function() {
            this.renderLineChart('cto','Click-To-Open Rate By Day', '%');
        },

        renderClicksChart: function() {
            this.renderLineChart('clicks','Clicks By Day', 'Clicks');
        },

        renderOpensChart: function() {
            this.renderLineChart('opens','Opens By Day', 'Opens');
        },

        renderOpenRateChart: function() {
            this.renderLineChart('openrate', 'Open Rate By Date', '%');
        },

        renderLineChart: function(type, title, axis) {
            var self = this;
            var div = $('#'+type+'-chart').show();
            var chartName = type+"Chart";
            if(!(chartName in this)){
                var emailTypeSet = {};
                var dateSet = {};
                var eSeries = {};
                var cLabel = "clicks";
                var oLabel = "opens";
                var dLabel = "delivered";
                var iLabel = "instance_id";
                _.each(self.results.attributes.instances, function(inst){
                    var sentDate = window.formatDate(inst.date);
                    dateSet[sentDate] = 1;
                    emailTypeSet[inst.email_type] = 1;
                    if(!(sentDate in eSeries)){
                        eSeries[sentDate] = {};
                    }
                    eSeries[sentDate][inst.email_type + cLabel] = inst.report.clicks;
                    eSeries[sentDate][inst.email_type + oLabel] = inst.report.opens;
                    eSeries[sentDate][inst.email_type + dLabel] = inst.report.delivered;
                });

                var categories = [];
                for(dte in dateSet){ categories.push(dte); }
                var emailTypes = [];
                var series = [];
                for(t in emailTypeSet){
                    series.push({name:t, data:[]});
                    emailTypes.push(t);
                }

                categories.sort();
                _.each(categories, function(cat){
                    _.each(series, function(s) {
                        var count = eSeries[cat][s.name + cLabel];
                        if(!count){ return; }
                        var rate = 0.0;
                        var display = rate.toFixed(2);
                        switch(type){
                        case 'ctr':
                            var del = eSeries[cat][s.name + dLabel];
                            if(!del){ break; }
                            rate = (eSeries[cat][s.name + cLabel]/del) * 100;
                            display = rate.toFixed(2);
                            break;
                        case 'cto':
                            var opens = eSeries[cat][s.name + oLabel];
                            if(!opens){ break; }
                            rate = (eSeries[cat][s.name + cLabel]/opens) * 100;
                            display = rate.toFixed(2);
                            break;
                        case 'clicks':
                            rate = eSeries[cat][s.name + cLabel];
                            display = window.numberWithCommas(rate);
                            break;
                        case 'opens':
                            rate = eSeries[cat][s.name + oLabel];
                            display = window.numberWithCommas(rate);
                            break;
                        case 'openrate':
                            var del = eSeries[cat][s.name + dLabel];
                            if(!del){ break; }
                            rate = (eSeries[cat][s.name + oLabel]/del) * 100;
                            display = rate.toFixed(2);
                            break;
                        };

                        s.data.push({y:rate, x:categories.indexOf(cat), display: display, tr_id: 'realtime-'+s.name+'-'+cat});
                    });
                });
                this[chartName] = div.highcharts({
                    chart: {
                        type:'line',
                    },
                    plotOptions: {
                        line: {
                            point: {
                                events: {
                                    click: function(){
                                        self.scrollToRow(this.tr_id);
                                    } 
                                }
                            },
                            cursor:'pointer'
                        }
                    },
                    tooltip: {
                        formatter: function() {
                            var name = this.series.options.name;
                            return '<b>'+ this.x +'</b><br/>'+
                                name +': '+ this.point.display +' '+axis+'<br/>';
                        }
                    },
                    title: {
                        text:self.buildTitle(title, emailTypes)
                    },
                    yAxis: {
                        title: {
                            text: axis
                        },
                        min:0,
                        allowDecimals: false
                    },
                    xAxis: {
                        categories: categories,
                        labels: {
                            enabled: (categories.length <= 15)
                        }
                    },
                    credits:{enabled:false},
                    series:series
                });
            }
        },

        cleanCampaignName: function(name){
            return name.replace(" (DO NOT EDIT)","");
        },

        renderDeliveryChart: function() {
            var self = this;
            var div = $('#delivery-chart').show();
            if(!this.deliveryChart){
                $('#result-chart').show();
                var intervalSet = {};
                var emailTypeSet = {}; 
                var eSeries = {};
                var dLabel = " (delivered)";
                var bmLabel = " (bad mailbox)";
                var bdLabel = " (bad domain)";
                var sbLabel = " (soft bounce)";
                var totalLabel = "total";
                _.each(self.results.attributes.instances, function(instance){
                    var interval = window.formatDate(instance.date);
                    intervalSet[interval] = 1;
                    emailTypeSet[instance.email_type] = 1;
                    if(!(interval in eSeries)){
                        eSeries[interval] = {};
                    }
                
                    eSeries[interval][instance.email_type] = instance.report.delivered;
                    eSeries[interval][instance.email_type + bmLabel] = instance.report.bounced_mailbox;
                    eSeries[interval][instance.email_type + bdLabel] = instance.report.bounced_domain;
                    eSeries[interval][instance.email_type + sbLabel] = instance.report.bounced_unknown;
                    eSeries[interval][instance.email_type + totalLabel] = instance.report.delivered+instance.report.bounced_mailbox+instance.report.bounced_domain+instance.report.bounced_unknown;
                });

                var intervals = [];
                for(interval in intervalSet){ intervals.push(interval); }
                var emailTypes = [];
                var series = [];
                for(t in emailTypeSet){
                    emailTypes.push(t);
                    series.push({id:t,stack:t,name:t,data:[]});
                    series.push({linkedTo:t,stack:t,name:t + bmLabel,data:[], color:'#642726'});
                    series.push({linkedTo:t,stack:t,name:t + bdLabel,data:[], color:'#be5654'});
                    series.push({linkedTo:t,stack:t,name:t + sbLabel,data:[], color:'#da9f9e'});
                }
                _.each(intervals,function(interval){
                    _.each(series,function(s){
                        var count = eSeries[interval][s.name];
                        if(!count){
                           return;
                        }
                        s.data.push({y:count, x:intervals.indexOf(interval), tr_id: 'realtime-'+s.stack+'-'+interval, total:eSeries[interval][s.stack + totalLabel]});
                    });
                });
                
                intervals.sort();
                this.deliveryChart = div.highcharts({
                    chart: {
                        type:'column',
                        zoomType:'xy'
                    },
                    plotOptions: {
                        column: {
                            stacking:'normal',
                            cursor:'crosshair',
                            point: {
                                events: {
                                    click: function(){
                                        self.scrollToRow(this.tr_id);
                                    }
                                }
                            }
                        },
                        cursor:'pointer'
                    },
                    colors: window.altChartColors,
                    tooltip: {
                        formatter: function() {
                            var name = this.series.options.name;
                            if(name.indexOf("(") == -1){ name += dLabel; }
                            return '<b>'+ this.x +'</b><br/>'+
                                name +': '+ window.numberWithCommas(this.y) +' - '+ ((this.y/this.total)*100).toFixed(2) +'%<br/>';
                        }
                    },
                    title: {
                        text:self.buildTitle('Email Delivery By Day', emailTypes)
                    },
                    yAxis: {
                        title: {
                            text:'Emails'
                        },
                        min:0,
                        allowDecimals: false
                    },
                    xAxis: {
                        categories: intervals,
                        labels: {
                            enabled: (intervals.length <= 15)
                        }
                    },
                    credits:{enabled:false},
                    series:series
                });
            }
        },

        toggleSegments: function(e) { 
            e.preventDefault(); 
            var target = $(e.currentTarget); 
            var id = target.data('id'); 
            $('#waiting').modal('show');
            $('.toggle-instance-'+id).toggle();
            $('.instance-'+id).toggle();
            $('#waiting').modal('hide');
        },

        toggleColumnGroup: function(e) {
            $('#waiting').modal('show');
            e.preventDefault();
            var target = $(e.currentTarget);
            var colStr = target.data('cols');
            var cols = colStr.split(',');

            var reportTable = this.$el.find('#result-table').dataTable();
              
            _.each(cols, function(col) {
                var bVis = reportTable.fnSettings().aoColumns[col].bVisible;
                reportTable.fnSetColumnVis( col, bVis ? false : true );
            });
            $('#waiting').modal('hide');
        },

		runReport: function(e) {
			e.preventDefault();
			var start = $('#startDate').val();
            var end = $('#endDate').val();
            var type = this.$el.find('input[name=type]:checked').val();
            var query = "_";
            if(type == 'email-type'){
                query = $('#emailType').val(); 
                if(!query) {
                    alert('please select an Email Type');
                    return;
                }
            }
            else if(type == 'campaign-type'){
                query = $('#campaignType').val();
            }

            var url = 'report/performance/transactional/'+type+'/'+query+'/'+start+'/'+end;
            if($('#totalsOnly:checked').length){
                url += '?totalsOnly=true';
            }
			Backbone.history.navigate(url, {
				trigger: true
			});
		}

	});

	return TransPerformanceReportView;
});

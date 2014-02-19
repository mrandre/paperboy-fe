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

	var BulkPerformanceReportView = Backbone.View.extend({
		tagName: 'div',
        className: 'col-lg-12 col-md-12',
		initialize: function(emailProducts, campaignTypes, results, type, query, start, end, totalsOnly) {
			var self = this;
            this.campaignTypes = campaignTypes; 
            this.products = emailProducts;
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
            'click .instance-row': 'toggleSegments',
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
            case 'product':
                this.$el.find('#product-field').show();
                this.$el.find('#campaign-field').hide();
                this.$el.find('#campaign-type-field').hide();
                break;
            case 'campaign':
                this.$el.find('#product-field').hide();
                this.$el.find('#campaign-field').show();
                this.$el.find('#campaign-type-field').hide();
                break;
            case 'campaign-type':
                this.$el.find('#campaign-type-field').show();
                this.$el.find('#product-field').hide();
                this.$el.find('#campaign-field').hide();
                break;
            case 'none':
                this.$el.find('#product-field').hide();
                this.$el.find('#campaign-field').hide();
                this.$el.find('#campaign-type-field').hide();
                break;
            }
        },

		render: function() {
            var self = this;
            var renderReport = function(){
                templates.render(
                    'report/bulkPerformance',
                    {
                        'products':self.products,
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
                        self.$el.find('#productCode').select2({
                            placeholder:"SELECT A PRODUCT",   
                            allowClear: true,
                            width:"element"
                        });
                        self.$el.find('#campaign').select2({
                            multiple:true,
                            placeholder:"START TYPING TO FIND CAMPAIGNS",
                            id: function(campaign){ return campaign.id },
                            minimumInputLength: 3,
                            ajax: {
                                url: function(v){
                                    return window.api_host + 'campaign/search/' + v;
                                },
                                method:'GET',
                                results: function(data, page) {
                                    return {results: data};
                                }
                            },
                            formatResult: function(campaign) { return campaign.name; },
                            formatSelection: function(campaign) { $('#campaign').val(campaign.id); return campaign.name; }
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
                        null,
                        null,
                        {"bVisible": false},
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
                        {"bVisible": false},
                        {"bVisible": false},
                        null
                ] 
            });
        },

        getProductNames: function() {
           if(!this.prodNames){
                var self = this;
                _.each(self.productCodes,function(code){
                     self.prodNames[code] = self.products.getName(code);
                 });
            }
            return this.prodNames;
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
                case 'unsubrate':
                    self.renderUnsubRateChart();
                    break;
                case 'openrate':
                    self.renderOpenRateChart();
                    break;
                }
            });
            var charts = ['delivery','openrate','opens','clicks','ctr','cto','unsubrate'];
            _.each(charts, function(c){
                if(!(c in types)){
                    self.$el.find('#'+c+'-chart').hide(); 
                } 
            });
            $('.highlight-row').removeClass('highlight-row');
        },

        buildCampaignTitle: function(name, campaigns){
            var title = name + ": ";
            var j = 0;
            campaigns.sort();
            _.each(campaigns,function(code){
                title += code;
                if(j < campaigns.length - 2){
                    title += ", ";
                }
                else if(j == campaigns.length - 2) {
                    title += " and ";
                }
                j++;
            });

            title += " from " + this.start + " to " + this.end;
            return title;
        },
        
        scrollToRow: function(instIds){
            var instId = instIds[0];
            var row = this.$el.find('#instance-'+instId);
            var rownum = row.data('row');
            var tOffset = this.$el.find('#result-list table tr:eq('+rownum+')').offset().top;

            $('body, html').animate({
                scrollTop: tOffset - 100
            }, 500);

            $('.highlight-row').removeClass('highlight-row');
            _.each(instIds, function(id){
                $('#instance-'+id).addClass('highlight-row');
            });
        },

        renderCTRChart: function() {
            this.renderLineChart('ctr','Click Through Rate By Day', '%');
        },

        renderCTOChart: function() {
            this.renderLineChart('cto','Click-To-Open Rate By Day', '%');
        },

        renderUnsubRateChart: function() {
            this.renderLineChart('unsubrate','Unsubscribe Rate By Day', '%');
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
                var campaignSet = {};
                var dateSet = {};
                var cSeries = {};
                var cLabel = "clicks";
                var oLabel = "opens";
                var uLabel = "unsubs";
                var dLabel = "delivered";
                var iLabel = "instance_id";
                _.each(self.results.attributes.instances, function(inst){
                    var sentDate = window.formatDate(inst.start);
                    inst.campaign_name = self.cleanCampaignName(inst.campaign_name);
                    dateSet[sentDate] = 1;
                    campaignSet[inst.campaign_name] = 1;
                    if(!(sentDate in cSeries)){
                        cSeries[sentDate] = {};
                    }
                    if(!(inst.campaign_name in cSeries[sentDate])){
                        cSeries[sentDate][inst.campaign_name + cLabel] = 0;
                        cSeries[sentDate][inst.campaign_name + oLabel] = 0;
                        cSeries[sentDate][inst.campaign_name + uLabel] = 0;
                        cSeries[sentDate][inst.campaign_name + dLabel] = 0;
                        cSeries[sentDate][inst.campaign_name] = 0;
                        cSeries[sentDate][inst.campaign_name + iLabel] = [];
                    }

                    cSeries[sentDate][inst.campaign_name + cLabel] += inst.report.clicks;
                    cSeries[sentDate][inst.campaign_name + oLabel] += inst.report.opens;
                    cSeries[sentDate][inst.campaign_name + dLabel] += inst.report.delivered;
                    cSeries[sentDate][inst.campaign_name + uLabel] += inst.report.unsubscribes;
                    cSeries[sentDate][inst.campaign_name + iLabel].push(inst.id);
                    cSeries[sentDate][inst.campaign_name]++;
                });

                var categories = [];
                for(dte in dateSet){ categories.push(dte); }
                var campaigns = [];
                var series = [];
                for(camp in campaignSet){
                    series.push({name:camp, data:[]});
                    campaigns.push(camp);
                }

                categories.sort();
                _.each(categories, function(cat){
                    _.each(series, function(s) {
                        var count = cSeries[cat][s.name];
                        if(!count){ return; }
                        var rate = 0.0;
                        var display = rate.toFixed(2);
                        switch(type){
                        case 'ctr':
                            var del = cSeries[cat][s.name + dLabel];
                            if(!del){ break; }
                            rate = (cSeries[cat][s.name + cLabel]/del) * 100;
                            display = rate.toFixed(2);
                            break;
                        case 'cto':
                            var opens = cSeries[cat][s.name + oLabel];
                            if(!opens){ break; }
                            rate = (cSeries[cat][s.name + cLabel]/opens) * 100;
                            display = rate.toFixed(2);
                            break;
                        case 'clicks':
                            rate = cSeries[cat][s.name + cLabel];
                            display = window.numberWithCommas(rate);
                            break;
                        case 'opens':
                            rate = cSeries[cat][s.name + oLabel];
                            display = window.numberWithCommas(rate);
                            break;
                        case 'unsubrate':
                            var del = cSeries[cat][s.name + dLabel];
                            if(!del){ break; }
                            rate = (cSeries[cat][s.name + uLabel]/del) * 100;
                            display = rate.toFixed(2);
                            break; 
                        case 'openrate':
                            var del = cSeries[cat][s.name + dLabel];
                            if(!del){ break; }
                            rate = (cSeries[cat][s.name + oLabel]/del) * 100;
                            display = rate.toFixed(2);
                            break;
                        };

                        s.data.push({y:rate, x:categories.indexOf(cat), display: display, instance_ids: cSeries[cat][s.name + iLabel], instances:cSeries[cat][s.name]});
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
                                        self.scrollToRow(this.instance_ids);
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
                                name +': '+ this.point.display +' '+axis+'<br/>' +
                                'From '+this.point.instances+' instance(s)';
                        }
                    },
                    title: {
                        text:self.buildCampaignTitle(title, campaigns)
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
                var campaignSet = {}; 
                var campSeries = {};
                var dLabel = " (delivered)";
                var bmLabel = " (bad mailbox)";
                var bdLabel = " (bad domain)";
                var sbLabel = " (soft bounce)";
                var totalLabel = "total";
                var instLabel = "instances";
                _.each(self.results.attributes.instances, function(instance){
                    var interval = window.formatDate(instance.start);
                    if(instance.campaign_name.indexOf("DO NOT EDIT") != -1){
                        instance.campaign_name = instance.campaign_name.replace(" (DO NOT EDIT)","");
                    }
                    intervalSet[interval] = 1;
                    campaignSet[instance.campaign_name] = 1;
                    if(!(interval in campSeries)){
                        campSeries[interval] = {};
                    }
                    if(!(instance.campaign_name in campSeries[interval])){
                        campSeries[interval][instance.campaign_name] = 0;
                        campSeries[interval][instance.campaign_name + bmLabel] = 0;
                        campSeries[interval][instance.campaign_name + bdLabel] = 0;
                        campSeries[interval][instance.campaign_name + sbLabel] = 0; 
                        campSeries[interval][instance.campaign_name + totalLabel] = 0;
                        campSeries[interval][instance.campaign_name + instLabel] = [];
                    }
                
                    campSeries[interval][instance.campaign_name] += instance.report.delivered;
                    campSeries[interval][instance.campaign_name + bmLabel] += instance.report.bounced_mailbox;
                    campSeries[interval][instance.campaign_name + bdLabel] += instance.report.bounced_domain;
                    campSeries[interval][instance.campaign_name + sbLabel] += instance.report.bounced_unknown;
                    campSeries[interval][instance.campaign_name + totalLabel] += instance.report.delivered+instance.report.bounced_mailbox+instance.report.bounced_domain+instance.report.bounced_unknown;
                    campSeries[interval][instance.campaign_name + instLabel].push(instance.id);
                });

                var intervals = [];
                for(interval in intervalSet){ intervals.push(interval); }
                var campaigns = [];
                var series = [];
                for(camp in campaignSet){
                    campaigns.push(camp);
                    series.push({id:camp,stack:camp,name:camp,data:[]});
                    series.push({linkedTo:camp,stack:camp,name:camp + bmLabel,data:[], color:'#642726'});
                    series.push({linkedTo:camp,stack:camp,name:camp + bdLabel,data:[], color:'#be5654'});
                    series.push({linkedTo:camp,stack:camp,name:camp + sbLabel,data:[], color:'#da9f9e'});
                }
                _.each(intervals,function(interval){
                    _.each(series,function(s){
                        var count = campSeries[interval][s.name];
                        if(!count){
                           return;
                        }
                        s.data.push({y:count, x:intervals.indexOf(interval), instances:campSeries[interval][s.stack + instLabel], total:campSeries[interval][s.stack + totalLabel]});
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
                                        self.scrollToRow(this.instances);
                                    }
                                }
                            },
                            cursor:'pointer'
                        }
                    },
                    colors: window.altChartColors,
                    tooltip: {
                        formatter: function() {
                            var name = this.series.options.name;
                            if(name.indexOf("(") == -1){ name += dLabel; }
                            return '<b>'+ this.x +'</b><br/>'+
                                name +': '+ window.numberWithCommas(this.y) +' - '+ ((this.y/this.total)*100).toFixed(2) +'%<br/>'+
                                    'From '+this.point.instances.length+' instance(s)';
                        }
                    },
                    title: {
                        text:self.buildCampaignTitle('Email Delivery By Day', campaigns)
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
            if(type == 'product'){
                query = $('#productCode').val(); 
                if(!query) {
                    alert('please select an Email Product');
                    return;
                }
            }
            else if(type == 'campaign'){
                query = $('#campaign').val();
                if(!query) {
                    alert('please select a Campaign');
                    return;
                }
            }
            else if(type == 'campaign-type'){
                query = $('#campaignType').val();
            }

            var url = 'report/performance/bulk/'+type+'/'+query+'/'+start+'/'+end;
            if($('#totalsOnly:checked').length){
                url += '?totalsOnly=true';
            }
			Backbone.history.navigate(url, {
				trigger: true
			});
		}

	});

	return BulkPerformanceReportView;
});

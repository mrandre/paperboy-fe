define([
	'underscore',
	'backbone',
	'xdr'
], function(_, Backbone, xdr) {
    var ReportModels = {}

    ReportModels.BulkPerformanceResult = Backbone.Model.extend({
        url: function() {
            var url = window.api_host +
                "report/performance/bulk/"+
                    this.attributes.type+"/"+
                    this.attributes.query+"/"+
                    this.attributes.start+"/"+
                    this.attributes.end;
            if(this.attributes.totalsOnly){
                url += "?totals-only="+this.attributes.totalsOnly;
            }
            return url;
        }     
    });

    ReportModels.TransPerformanceResult = Backbone.Model.extend({
        url: function() {
            var url = window.api_host +
                "report/performance/transactional/"+
                    this.attributes.type+"/"+
                    this.attributes.query+"/"+
                    this.attributes.start+"/"+
                    this.attributes.end;
            if(this.attributes.totalsOnly){
                url += "?totals-only="+this.attributes.totalsOnly;
            }
            return url;
        }
    });

    ReportModels.ProductSubscription = Backbone.Model.extend({});
    ReportModels.ProductSubscriptions = Backbone.Collection.extend({
        initialize: function(models, options) {
            this.productCode = options.productCode;
            this.start = options.start;
            this.end = options.end;
            if(!this.end){
                this.end = this.start;
            }
        },
        url: function() {
            return window.api_host + 
                "report/prod-subscriptions/"+
                        this.productCode+"/"
                        +this.start+"/"
                        +this.end;
        },
        model: ReportModels.ProductSubscription
    });

    ReportModels.ProductSubscriptionAcquisition = Backbone.Model.extend({});
    ReportModels.ProductSubscriptionAcquisitions = Backbone.Collection.extend({
        initialize: function(models, options) {
            this.productCode = options.productCode;
            this.interval = options.interval;
            this.start = options.start;
            this.end = options.end;
            if(!this.end){
                this.end = this.start;
            }
        },
        url: function() {
            return window.api_host +
                "report/prod-subcription-diffs/"+
                        this.productCode+"/"
                        +this.interval+"/"
                        +this.start+"/"
                        +this.end;
        },
        model: ReportModels.ProductSubscriptionAcquisition
    });
	return ReportModels;
});

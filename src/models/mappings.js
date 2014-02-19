define([
    'backbone',
], function(Backbone) {
    var MappingModels = {};

    MappingModels.EmailType = Backbone.Model.extend({});
    MappingModels.EmailTypes = Backbone.Collection.extend({
        initialize: function(attr,opts) {
            this.keepFetching();
        },
        url: function() {
            return window.api_host + 'types/email-types';
        },
        model: MappingModels.EmailType,
        keepFetching: function(){
            var self = this;
            this.fetch({
                reset:true,
                complete:function(data){
                    setTimeout(function(){
                        self.keepFetching();
                    }, 600000);
                }
            });
        },
    });

    MappingModels.GroupTypes = Backbone.Model.extend({
        url: function() {
            return window.api_host + "types/group-types";
        }
    });

    MappingModels.CampaignTypes = Backbone.Model.extend({
        initialize: function(attr,opts) {
            this.keepFetching();
        },
        url: function() {
            return window.api_host + "types/campaign-types";
        },
        keepFetching: function(){
            var self = this;
            this.fetch({
                reset:true,
                complete:function(data){
                    setTimeout(function(){
                        self.keepFetching();
                    }, 600000);
                }
            });
        }
    });

    MappingModels.EmailProduct = Backbone.Model.extend({});
    MappingModels.EmailProducts = Backbone.Collection.extend({
        initialize: function(attr,opts) {
            this.keepFetching();
        },
        url: function() {
            return window.api_host + 'types/products';
        },
        model: MappingModels.EmailProduct,
        keepFetching: function(){
            var self = this;
            this.fetch({
                reset:true,
                complete:function(data){
                    setTimeout(function(){
                        self.keepFetching();
                    }, 600000);
                }
            });
        },
        getName: function(code) {
            var name = "";
            for(var i=0; i < this.models.length; i++){
                if(this.models[i].attributes.code == code){
                    name = this.models[i].attributes.name;
                    break;
                }
            }
            return name;
        }
    });

    return MappingModels;
});

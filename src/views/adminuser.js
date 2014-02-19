define([
	'jquery',
    'underscore',
	'backbone',
    'models/adminuser',
    'models/mappings',
    'templates',
    'datatables'
], function ($, _, Backbone, AdminUser, Mappings, templates, datatables) {
    var AdminUserViews = {};

    var GenericError = function(data, response) {
        console.log("hello");
        this.$el.find('error').show();
    };

    AdminUserViews.ListView = Backbone.View.extend({
        tagName: 'div',
        initialize: function (adminUsers) {
            this.adminUsers = adminUsers;
            this.delegateEvents();
            this.render();
        },
        render: function () {
            var self = this;

            self.adminUsers.fetch({
                success: function(data, response) {
                    templates.render('adminuser', self.adminUsers, function(templateData) {
                        self.$el.html(templateData);
                        self.$el.find('#admin-user-table').dataTable({
                                "bPaginate": false,
                                "sDom":'<fi"top">t'
                        });
                    });
                },

                error: function(data, response) {
                    templates.render('adminuser', self.adminUsers, function(templateData) {
                        self.$el.html(templateData);
                        self.$el.find('.error').show();
                        self.$el.find('.main').hide();
                    });
                },
            });
        }
    });
    
    AdminUserViews.EditView = Backbone.View.extend({
        tagName: 'div',
        initialize: function (adminUser) {
            this.adminUser = adminUser;
            this.delegateEvents();
            this.render();

            this.listenTo(adminUser, 'change:id', this.changeUrl);
        },


        // When the id attribute changes, make sure to change the URL.
        // This is typical when saving a new user.
        changeUrl: function(e) {
            Backbone.history.navigate("users/admin/" + this.adminUser.get("id"));
        },

        saveAdminUser: function(e) {
            adminuserdebug = this.adminUser;
            e.preventDefault();

			$('#waiting').modal('show');
            this.adminUser.save(
                {
                    name: this.$el.find('#name').val(),
                    email: this.$el.find('#email').val(),
                    campaign_types: window.stringsToInts(this.$el.find('#campaign_type_select').val()),
                    group_id_types: window.stringsToInts(this.$el.find('#group_type_select').val()),
                    api_key: this.$el.find('#is_api_key').is(':checked')
                },

                {
                    success: function() {
                        $('#waiting').modal('hide');
                        $('#saved-success').modal('show');
                        setTimeout(function() { $('#saved-success').modal('hide');}, 2000);
                    },

                    error: function() {
                        $('#waiting').modal('hide');
                        $('#saved-error').modal('show');
                        setTimeout(function() { $('#saved-error').modal('hide');}, 2000);
                    },
                }
            );
        },

        promptDeleteAdminUser: function(e) {
            e.preventDefault();
            var self = this;
            $('#delete-ok-dialog #ok-answer').val(0);
            $('#delete-ok-dialog').modal('show');
           },


        deleteAdminUser: function(e) {
            $('#waiting').modal('hide');
            e.preventDefault();
            this.adminUser.destroy({
                success: function(model, response, options) {
                    Backbone.history.navigate("users/admin", {trigger: true});
                },
                error: function(model, xhr, options) {
                    $('#delete-error').modal('show');
                    setTimeout(function() { $('#delete-error').modal('hide');}, 2000);
                },
                wait: true
            });
        },

        events: {
            "click #save": "saveAdminUser",
            "click #delete": "promptDeleteAdminUser",
            "click #delete-confirmed-yes": "deleteAdminUser"
        },

        render: function () {
            var self = this;

            var groupTypes = new Mappings.GroupTypes();
            var campaignTypes = new Mappings.CampaignTypes();
            var tempVars = {};
            tempVars.groupTypes = groupTypes;
            tempVars.campaignTypes = campaignTypes;
            tempVars.adminUser = self.adminUser;


            // Magic number 3 because we have 3 models
            var renderWait = _.after(3, function(data, response) {
                templates.render('adminuserEdit', tempVars, 
                    function(templateData) {
                        self.$el.html(templateData);
                        self.$el.find('#group_type_select');
                        self.$el.find('#campaign_type_select');
                    });
            });

            var renderError =  function(data, response) {
                templates.render('adminuserEdit', tempVars, function(templateData) {
                    self.$el.html(templateData);
                    self.$el.find('.error').show();
                    self.$el.find('.main').hide();
                });
            };

            groupTypes.fetch({success: renderWait, error: renderError});
            campaignTypes.fetch({success: renderWait, error: renderError});
            self.adminUser.fetch({success: renderWait, error: renderError});
        }
    });

    return AdminUserViews;
});

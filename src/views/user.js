define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'datatables',
	'templates',
	'qtip',
	'xdr',
    'models/user'
], function($, bootstrap, _, Backbone, datatables, templates, qtip, xdr, User) {

	var UserDossierView = Backbone.View.extend({
		tagName: 'div',
		initialize: function(dossier) {
			this.dossier = dossier;
			this.delegateEvents();
			this.render();
		},

        events: {
            "click .alert-row": "renderAlert"
        },

		render: function() {
			$('.search-query').val('');
			$('#waiting').modal({
				show: true,
				keyboard: false
			});
			var self = this;

			self.dossier.fetch({
				reset: true,
				error: function(data, response) {
					templates.render('users', self.dossier.attributes, function(templateData) {
						self.$el.html(templateData);
						self.$el.find('.error').show();
						self.$el.find('.welcome').hide();
						$('#waiting').modal('hide');
					});
				},
				success: function() {
					templates.render('user', self.dossier.attributes.profile, function(templateData) {
						self.$el.html(templateData);
						self.$el.find('.error').show();
						self.$el.find('.welcome').hide();
						$('#waiting').modal('hide');

						self.$el.find('#history-table').dataTable({
							"sDom": '<"top"ip>rt<"bottom"><"clear">',
							"bLengthChange": false,
							"iDisplayLength": 5,
							"bFilter": false,
							"sPaginationType": "full_numbers",
							"bSort": false,
							"oLanguage": {
								"sEmptyTable": '',
								"sZeroRecords": '',
								"sInfo": "_START_ TO _END_ OF _TOTAL_ EMAILS SENT",
								"sInfoEmpty": "0 OF 0",
								"oPaginate": {
									"sFirst": "FIRST",
									"sLast": "LAST",
									"sNext": "NEXT",
									"sPrevious": "PREV"
								}
							}
						});

						$('.has-tip').qtip({
							style: 'qtip-bootstrap'
						});
						$('#waiting').modal('hide');
					});
				}
			});
		},

		renderAlert: function(e) {
            var target = $(e.currentTarget);
            if((target.data("expanded")!="true")) {
                var alert_id = target.data("alert-id");
                var alert = new User.UserAlert({ id: alert_id });
                $('#waiting').modal({
                    show: true,
                    keyboard: false
                });
                alert.fetch({
                    reset: true,
                    complete: function(data, response){
                        templates.render('alert', alert.attributes, function(templateData){
                            target.data('expanded','true');
                            target.find(".glyphicon-expand").removeClass('glyphicon-expand').addClass('glyphicon-collapse-down');
                            var tmpl = $(templateData);
                            target.after(tmpl); 
                            tmpl.fadeIn();
                            $('#waiting').modal("hide")
                        });
                    }
                });
            }
            else {
                target.data("expanded","false");
                target.find(".glyphicon-collapse-down").removeClass('glyphicon-collapse-down').addClass('glyphicon-expand');
                target.next().remove();
            }
		}
	});

	return UserDossierView;
});

define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'models/article/article',
	'views/article/article'
], function($, bootstrap, _, Backbone, templates, xdr, articleModels, articleViews) {
	var sectionViews = {};

	sectionViews.SectionsListView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(sections, callback) {
			this.sections = sections;
			var self = this;
			$('#waiting').modal('show');

			templates.fetch('article/sections', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;

			this.sections.fetch({
				reset: true
			}).complete(function() {
				//preload list template
				templates.fetch(sectionViews.SectionSummaryViewTemplateName, function() {
					self.sections.each(function(section) {
						self.renderSectionSummary(section);
					});

					$('#waiting').modal('hide');
				});

			});

		},

		renderSectionSummary: function(item) {
			var view = new sectionViews.SectionSummaryView({
				model: item
			});
			$(this.$el.find('.section-list')).append(view.render());
		}
	});

	sectionViews.SectionView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(section, callback) {
			this.section = section;
			var self = this;
			$('#waiting').modal('show');
			templates.fetch('article/section', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		// render library by rendering each book in its collection
		render: function() {
			this.$el.html(this.template);
			var self = this;

			this.section.fetch({
				reset: true
			}).complete(function() {

				templates.render('article/sectionInfoTemplate', self.section.toJSON(), function(templateData) {
					$(self.$el.find('.section-info')).html(templateData);

					//preload list template
					templates.fetch(articleViews.ArticleSummaryViewTemplateName, function() {

						$(self.section.attributes.articles).each(function(article) {
							self.renderArticleSummary(new articleModels.ArticleSummary(this));
						});

						$('#waiting').modal('hide');
					});
				});

			});

		},

		renderArticleSummary: function(item) {
			var view = new articleViews.ArticleSummaryView({
				model: item
			});
			$(this.$el.find('.article-list')).append(view.render());
		},

	});

	sectionViews.SectionSummaryViewTemplateName = 'article/sectionSummaryTemplate';
	sectionViews.SectionSummaryView = Backbone.View.extend({
		tagName: 'p',

		render: function() {
			var templateData = templates.cache[sectionViews.SectionSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});


	return sectionViews;
});

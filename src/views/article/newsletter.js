define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'models/article/article',
	'models/article/author',
	'views/article/article'
], function($, bootstrap, _, Backbone, templates, xdr, articleModels, authorModels,
	articleViews) {
	var newsletterViews = {};

	newsletterViews.NewslettersListView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(newsletters, callback) {
			this.newsletters = newsletters;
			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/newsletters', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;
			//preload list templates
			templates.fetch(newsletterViews.NewsletterSummaryViewTemplateName, function() {
				
				self.$el.find('.newsletter-list').html('');
				self.newsletters.fetch({
					reset: true
				}).complete(function() {
					self.newsletters.each(function(newsletter) {
						self.renderNewsletterSummary(newsletter);
					});

					$('#waiting').modal('hide');
				});
			});
		},

		renderNewsletterSummary: function(item) {
			var view = new newsletterViews.NewsletterSummaryView({
				model: item
			});

			$(this.$el.find('.newsletter-list')).append(view.render());
		}
	});

	newsletterViews.NewsletterView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(newsletter, callback) {
			this.newsletter = newsletter;

			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/newsletter', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;

			$('.article-list').html('');
			this.newsletter.fetch({
				reset: true
			}).complete(function() {
				//preload list template
				templates.fetch(newsletterViews.NewsletterArticleSummaryViewTemplateName, function() {
                    templates.fetch(newsletterViews.AuthorSummaryViewTemplateName, function() {
					    templates.render('article/newsletterInfoTemplate', self.newsletter.toJSON(), function(templateData) {
                            
                            $(self.$el.find('.newsletter-info')).html(templateData);
                            var list = $(self.$el.find('.article-list'));
                            $(self.newsletter.attributes.articles).each(function(article) {
                                self.renderArticleSummary(new articleModels.ArticleSummary(this));
                            });

                            $(self.newsletter.attributes.authors).each(function(nl) {
                                self.renderAuthorSummary(new authorModels.AuthorNewsletterSummary(this));
                            });

                            $('#waiting').modal('hide');

					    });
                    });
				});
			});
		},

		renderArticleSummary: function(item) {
			var view = new newsletterViews.NewsletterArticleSummaryView({
				model: item
			});
			$(this.$el.find('.article-list')).append(view.render());
		},

        renderAuthorSummary: function(item) {
            var view = new newsletterViews.AuthorSummaryView({
                model: item
            });
            $(this.$el.find('.author-list')).append(view.render());
        },

	});

	newsletterViews.NewsletterArticleSummaryViewTemplateName = 'article/newsletterArticleSummaryTemplate';
	newsletterViews.NewsletterArticleSummaryView = Backbone.View.extend({
		tagName: 'p',
		// template must be preloaded!
		render: function() {
			var templateData = templates.cache[newsletterViews.NewsletterArticleSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});

	newsletterViews.NewsletterSummaryViewTemplateName = 'article/newsletterSummaryTemplate';
	newsletterViews.NewsletterSummaryView = Backbone.View.extend({
		tagName: 'p',
		// template must be preloaded!
		render: function() {
			var templateData = templates.cache[newsletterViews.NewsletterSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});

    newsletterViews.AuthorSummaryViewTemplateName = 'article/authorSummaryTemplate';
    newsletterViews.AuthorSummaryView = Backbone.View.extend({
        tagName: 'p',
        render: function() {
            var templateData = templates.cache[newsletterViews.AuthorSummaryViewTemplateName](this.model.toJSON());
            this.$el.html(templateData);
            return this.el;
        }
    });

	return newsletterViews;
});

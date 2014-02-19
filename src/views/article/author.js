define([
	'require',
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'models/article/article',
	'models/article/author',
	'views/article/article',
	'views/article/newsletter'
], function(require, $, bootstrap, _, Backbone, templates, xdr, articleModels, authorModels,
	articleViews, newsletterViews) {
	var authorViews = {};

	authorViews.AuthorView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(author, callback) {
			this.author = author;
			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/author', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;

			$('.article-list').html('');
			this.author.fetch({
				reset: true
			}).complete(function() {
				//preload list templates first
				templates.fetch(articleViews.ArticleSummaryViewTemplateName,function(){
					templates.fetch(newsletterViews.NewsletterSummaryViewTemplateName,function(){
					
						templates.render('article/authorInfoTemplate', self.author.toJSON(), function(templateData) {

							$(self.$el.find('.author-info')).html(templateData);

							$(self.author.attributes.articles).each(function(article) {
								self.renderArticleSummary(new articleModels.ArticleSummary(this));
							});

							$(self.author.attributes.newsletters).each(function(nl) {
								self.renderNewsletterSummary(new authorModels.AuthorNewsletterSummary(this));
							});
							$('#waiting').modal('hide');
						});	
						
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

		renderNewsletterSummary: function(item) {
			var view = new newsletterViews.NewsletterSummaryView({
				model: item
			});
			$(this.$el.find('.newsletter-list')).append(view.render());
		},

	});

	authorViews.AuthorsListView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(authors, callback) {
			this.authors = authors;
			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/authors', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			this.$el.html(this.template);
			var self = this;
			$('.author-list').html('');
			this.authors.fetch({
				reset: true
			}).complete(function() {
				// preload template so loop can avoid callbacks			
				templates.fetch(authorViews.AuthorSummaryViewTemplateName, function() {
					self.authors.each(function(author) {
						self.renderAuthorSummary(author);
					});
					$('#waiting').modal('hide');
				}, true);
			});

		},

		renderAuthorSummary: function(item) {
			var self = this;
			var view = new authorViews.AuthorSummaryView({
				model: item
			});

			$(this.$el.find('.author-list')).append(view.render());

		}
	});

	authorViews.AuthorSummaryViewTemplateName = 'article/authorSummaryTemplate';
	authorViews.AuthorSummaryView = Backbone.View.extend({
		tagName: 'p',
		render: function() {
			var templateData = templates.cache[authorViews.AuthorSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});

	return authorViews;
});

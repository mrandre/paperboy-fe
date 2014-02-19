define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'views/article/author',
	'views/article/article',
	'views/article/newsletter'
], function($, bootstrap, _, Backbone, templates, xdr, authorViews, articleViews, newsletterViews) {

	var ArticleLeadersView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(authors, articles, newsletters, callback) {
			this.authors = authors;
			this.articles = articles;
			this.newsletters = newsletters;

			$('#waiting').modal('show');

			var self = this;
			templates.fetch('article/leaderboard', function(templateData) {
				self.$el.html(templateData);
				self.render(callback);
			});
		},

		render: function(callback) {
			callback(this.el);			
			var self = this;
			this.preloadTemplates(function() {

				self.$el.find('.author-list').html('');
				self.authors.fetch({
					reset: true
				}).complete(function() {
					self.authors.each(function(author) {
						self.renderAuthorSummary(author);
					});
				});

				self.$el.find('.article-list').html('');
				self.articles.fetch({
					reset: true
				}).complete(function() {
					self.articles.each(function(article) {
						self.renderArticleSummary(article);
					});

					$('#waiting').modal('hide');
				});

				self.$el.find('.newsletter-list').html('');
				self.newsletters.fetch({
					reset: true
				}).complete(function() {
					self.newsletters.each(function(nl) {
						self.renderNewsletterSummary(nl);
					});
				});
			});
		},

		preloadTemplates: function(callback) {
			templates.fetch(authorViews.AuthorSummaryViewTemplateName,function() { 
				templates.fetch(articleViews.ArticleSummaryViewTemplateName,function() { 
					templates.fetch(newsletterViews.NewsletterSummaryViewTemplateName,function() { 
						callback();
					});
				});
			});				
		},

		renderAuthorSummary: function(item) {
			var view = new authorViews.AuthorSummaryView({
				model: item
			});

			var el = view.render();
			$(this.$el.find('.author-list')).append(el);
		},

		renderArticleSummary: function(item) {
			var view = new articleViews.ArticleSummaryView({
				model: item
			});
			var el = view.render();
			$(this.$el.find('.article-list')).append(el);
		},

		renderNewsletterSummary: function(item) {
			var view = new newsletterViews.NewsletterSummaryView({
				model: item
			});
			var el = view.render();
			$(this.$el.find('.newsletter-list')).append(el);
		}
	});
	return ArticleLeadersView;
});

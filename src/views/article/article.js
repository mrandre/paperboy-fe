define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',
	'xdr',
	'models/article/article',
	'models/article/author'
], function($, bootstrap, _, Backbone, templates, xdr, articleModels, authorModels) {
	var articleViews = {};

	articleViews.ArticlesListView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(articles, callback) {
			this.articles = articles;
			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/articles', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;
			//preload list template
			templates.fetch(articleViews.ArticleSummaryViewTemplateName, function() {

				$('.article-list').html('');
				self.articles.fetch({
					reset: true
				}).complete(function() {
					self.articles.each(function(article) {
						self.renderArticleSummary(article);
					});
					$('#waiting').modal('hide');
				});
			});

		},

		renderArticleSummary: function(item) {
			var view = new articleViews.ArticleSummaryView({
				model: item
			});
			$(this.$el.find('.article-list')).append(view.render());
		}
	});

	articleViews.ArticleView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(article, callback) {
			this.article = article;
			$('#waiting').modal('show');
			var self = this;
			templates.fetch('article/article', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			this.$el.html(this.template);
			var self = this;
			$('.article-list').html('');
			this.article.fetch({
				reset: true
			}).complete(function() {
				//preload list template
				templates.fetch(articleViews.ArticleNewsletterViewTemplateName, function() {

					templates.render('article/articleTemplate', self.article.toJSON(), function(templateData) {
						$(self.$el.find('.article-info')).html(templateData);

						$(self.article.attributes.newsletters).each(function(newsletter) {
							self.renderArticleNewsletter(this);
						});

						$('#waiting').modal('hide');
					});


				});
			});

		},

		renderArticleNewsletter: function(item) {
			var self = this;
			var view = new articleViews.ArticleNewsletterView({
				model: item
			});
			view.render();
			if ((item.type == 'eta') || (item.type == 'my_alerts_email')) {
				$(this.$el.find('.article-ug')).append(view.el);
			} else {
				$(this.$el.find('.article-newsletters')).append(view.el);
			}
		}
	});

	articleViews.ArticleNewsletterViewTemplateName = 'article/articleNewsletterTemplate';
	articleViews.ArticleNewsletterView = Backbone.View.extend({
		tagName: 'p',

		render: function(newsletter) {
			var self = this;
			var templateData = templates.cache[articleViews.ArticleNewsletterViewTemplateName](this.model);
			this.$el.html(templateData);
			return this.el;
		}
	});

	articleViews.ArticleSummaryViewTemplateName = 'article/articleSummaryTemplate';
	articleViews.ArticleSummaryView = Backbone.View.extend({
		tagName: 'p',
		render: function() {
			var templateData = templates.cache[articleViews.ArticleSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});

	return articleViews;
});

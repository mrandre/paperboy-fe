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
	var blogViews = {};

	blogViews.BlogsListView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(blogs, callback) {
			this.blogs = blogs;
			var self = this;
			$('#waiting').modal('show');

			templates.fetch('article/blogs', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;

			this.$el.find('.blog-list').html('');

			this.blogs.fetch({
				reset: true
			}).complete(function() {
				//preload list template
				templates.fetch(blogViews.BlogSummaryViewTemplateName, function() {
					self.blogs.each(function(blog) {
						self.renderBlogSummary(blog);
					});

					$('#waiting').modal('hide');
				});
			});

		},

		renderBlogSummary: function(item) {
			var view = new blogViews.BlogSummaryView({
				model: item
			});
			$(this.$el.find('.blog-list')).append(view.render());
		}
	});

	blogViews.BlogView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(blog, callback) {
			this.blog = blog;
			var self = this;
			$('#waiting').modal('show');
			templates.fetch('article/blog', function(templateData) {
				self.$el.html(templateData);
				self.render();
				callback(self.el);
			});
		},

		render: function() {
			var self = this;

			this.blog.fetch({
				reset: true
			}).complete(function() {

				templates.render('article/blogInfoTemplate', self.blog.toJSON(), function(templateData) {
					$(self.$el.find('.blog-info')).html(templateData);

					//preload list template
					templates.fetch(articleViews.ArticleSummaryViewTemplateName, function() {

						$(self.blog.attributes.articles).each(function(article) {
							self.renderArticleSummary(new articleModels.ArticleSummary(this));
						});

						$('#waiting').modal('hide');
					});

				})

			});

		},

		renderArticleSummary: function(item) {
			var view = new articleViews.ArticleSummaryView({
				model: item
			});
			$(this.$el.find('.article-list')).append(view.render());
		},

	});

	blogViews.BlogSummaryViewTemplateName = 'article/blogSummaryTemplate';
	blogViews.BlogSummaryView = Backbone.View.extend({
		tagName: 'p',
		//template must be preloaded!
		render: function() {
			var templateData = templates.cache[blogViews.BlogSummaryViewTemplateName](this.model.toJSON());
			this.$el.html(templateData);
			return this.el;
		}
	});


	return blogViews;
});

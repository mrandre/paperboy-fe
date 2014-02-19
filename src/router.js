define([
	'jquery',
	'bootstrap',
	'underscore',
	'backbone',
	'templates',

	'views/login',
	'views/navbar',
	'views/users',
	'views/user',
	'views/dashboard',
    'views/report/subsByProd',
    'views/report/subAcqsByProd',
    'views/adminuser',
    'views/report/bulkPerformance',
    'views/report/transPerformance',

	'views/article/article',
	'views/article/author',
	'views/article/newsletter',
	'views/article/timeframe',
	'views/article/leaders',
	'views/article/blog',
	'views/article/section',
	'views/article/search',

	'models/article/author',
	'models/article/article',
	'models/article/newsletter',
	'models/article/blog',
	'models/article/section',
	'models/article/search',

	'models/user',
	'models/dashboard',
    'models/report',
    'models/mappings',
    
    'models/adminuser',
], function($, bootstrap, _, Backbone, templates,
	LoginView, NavbarView, UsersView, UserDossierView, DashboardView, SubscriptionsByProdView, SubscriptionAcquisitionsView, AdminUserViews,
    BulkPerformanceReportView, TransPerformanceReportView,
	articleViews, authorViews, newsletterViews, ArticleTimeframeView, ArticleLeadersView, blogViews, sectionViews, articleSearchViews,
	authorModels, articleModels, newsletterModels, blogModels, sectionModels, articleSearchModels,
	User, Dashboard, ReportModels, MappingModels, 
    
    AdminUserModels) {

	var navView = new NavbarView();

    var emailProducts = new MappingModels.EmailProducts();
    var campaignTypes = new MappingModels.CampaignTypes();
    var emailTypes = new MappingModels.EmailTypes();

	var AppRouter = Backbone.Router.extend({
		routes: {
			// ARTICLES
			'articles/authors(/:timeframe)(?sort=:sort)': 'articleAuthors',
			'articles/author/:name(/:timeframe)(?sort=:sort)': 'articleAuthor',

			'articles/newsletters(/:timeframe)(?sort=:sort)': 'articleNewsletters',
			'articles/newsletter/:name(/:timeframe)(?sort=:sort)': 'articleNewsletter',

			'articles/articles(/:timeframe)(?sort=:sort)': 'articleArticles',
			'articles/article?url=*url(&sort=:sort)': 'articleArticle',

			'articles/sections(/:timeframe)(?sort=:sort)': 'articleSections',
			'articles/section/:name(/:timeframe)(?sort=:sort)': 'articleSection',

			'articles/blogs(/:timeframe)(?sort=:sort)': 'articleBlogs',
			'articles/blog/:name(/:timeframe)(?sort=:sort)': 'articleBlog',

			'articles/leaderboard/*timeframe': 'articleLeaders',

			'articles/search(/:query)': 'articleSearch',

            // REPORTS
            'report/performance/bulk(/:type)(/:query)(/:start)(/:end)': 'bulkPerformance',
            'report/performance/transactional(/:type)(/:query)(/:start)(/:end)': 'transPerformance',
            'report/subscriptions/product(/:product)(/:start)(/:end)': 'subscriptionsByProduct',
            'report/subscriptions/acquisition(/:product)(/:interval)(/:start)(/:end)': 'subsAcqByProduct',

			// USERS
			'users/user/:email': 'user',
			'users': 'usersearch',
            'users/admin': 'useradmin',
            'users/admin/:id': 'useradminEdit',

			// LOGIN
			'login': 'login',
			'login?page=:page': 'login',
			'logout': 'logout',

			// DASHBOARD
			'': 'dashboard'
		},

		initialize: function() {
			navView.setNav('', false);
		},

		login: function() {
			navView.setNav('', false);
			var loginView = new LoginView();
			$("#content").html(loginView.el);
		},

		logout: function() {
			navView.setNav('', false);
			var loginView = new LoginView();
			loginView.logout();
			$("#content").html(loginView.el);
		},

		dashboard: function() {
			navView.setNav('', true);

			var dashboard = new Dashboard();
			var dash = new DashboardView(dashboard);
			$("#content").html(dash.el);
		},

		usersearch: function() {
			navView.setNav('users', false);

			$('#waiting').modal('hide');

			var usersView = new UsersView();

			$("#content").html(usersView.el);
		},

		user: function(query) {
			navView.setNav('users', false);

			var dossier = new User.UserDossier({
				id: query
			});

			var userView = new UserDossierView(dossier);
			$("#content").html(userView.el);
		},

        bulkPerformance: function(type, query, start, end) {
            navView.setNav('reports', false);
            var totalsOnly = ''; 
            if(end){
                var endVars = end.split('?');
                end = endVars[0];
                if(endVars.length > 1){
                    totalsOnly = endVars[1].replace('totalsOnly=','');
                }
            }
            
            var segments = new ReportModels.BulkPerformanceResult({
                type: type,
                query: query,
                start: start,
                end: end,
                totalsOnly:totalsOnly});
            
            var lookupView = new BulkPerformanceReportView(emailProducts, campaignTypes, segments, type, query, start, end, totalsOnly);
            $("#content").html(lookupView.el);
        },

        transPerformance: function(type, query, start, end) {
            navView.setNav('reports', false);
            var totalsOnly = '';
            if(end){
                var endVars = end.split('?');
                end = endVars[0];
                if(endVars.length > 1){
                    totalsOnly = endVars[1].replace('totalsOnly=','');
                }
            }

            var results = new ReportModels.TransPerformanceResult({
                type: type,
                query: query,
                start: start,
                end: end,
                totalsOnly:totalsOnly});

            var reportView = new TransPerformanceReportView(emailTypes, campaignTypes, results, type, query, start, end, totalsOnly);
            $("#content").html(reportView.el);
        },

        useradmin: function() {
			navView.setNav('users', false);

			$('#waiting').modal('hide');

            var adminUsers = new AdminUserModels.AdminUsers();

			var listView = new AdminUserViews.ListView(adminUsers);

			$("#content").html(listView.el);
		},

        useradminEdit: function(user_id) {
			navView.setNav('users', false);

			$('#waiting').modal('hide');

            var adminUser = new AdminUserModels.AdminUser({
                id: user_id
            });

			var editView = new AdminUserViews.EditView(adminUser);

			$("#content").html(editView.el);
		},

        subscriptionsByProduct: function(productCodes, start, end) {
            navView.setNav('reports', false);
            var subscriptions = new ReportModels.ProductSubscriptions([],{
                productCode: productCodes,
                start:start, 
                end:end}); 
            if(productCodes){
                productCodes = productCodes.split(',');
            }
            var subsByProdView = new SubscriptionsByProdView(emailProducts, subscriptions, productCodes, start, end); 
            $("#content").html(subsByProdView.el);
        },

        subsAcqByProduct: function(productCodes, interval, start, end) {
            navView.setNav('reports', false);
            var subscriptions = new ReportModels.ProductSubscriptionAcquisitions([],{
                productCode: productCodes,
                interval: interval,
                start:start,
                end:end});
            if(productCodes){
                productCodes = productCodes.split(',');
            }
            var subAcqsByProdView = new SubscriptionAcquisitionsView(emailProducts, subscriptions, productCodes, interval, start, end);
            $("#content").html(subAcqsByProdView.el);
        },

		articleLeaders: function(timeframe) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var authors = new authorModels.AuthorSummaries([], {
					timeframe: timeframe
				});
				var articles = new articleModels.ArticleSummaries([], {
					timeframe: timeframe
				});
				var newsletters = new newsletterModels.NewsletterSummaries([], {
					timeframe: timeframe
				});

				new ArticleLeadersView(authors, articles, newsletters, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});

		},

		articleAuthor: function(name) {
			navView.setNav('articles', false);

			var self = this;
			var articleTfView = new ArticleTimeframeView();
			articleTfView.render(function() {

				var timeframe = articleTfView.getAndSetTimeframe();

				var author = new authorModels.AuthorInfo({
					id: name.split('?')[0],
					timeframe: timeframe
				});

				var authorView = new authorViews.AuthorView(author, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});

		},

		articleAuthors: function(timeframe) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var authors = new authorModels.AuthorSummaries([], {
					timeframe: timeframe,
					all: true
				});

				new authorViews.AuthorsListView(authors, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleArticles: function(timeframe) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var articles = new articleModels.ArticleSummaries([], {
					timeframe: timeframe,
					all: true
				});

				var articlesView = new articleViews.ArticlesListView(articles, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleArticle: function(url) {
			navView.setNav('articles', false);

			var article = new articleModels.Article({
				id: url.split('?')[0]
			});

			var articleView = new articleViews.ArticleView(article, function(el) {
				$("#content").html(el);
			});
		},

		articleNewsletters: function() {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var nls = new newsletterModels.NewsletterSummaries([], {
					timeframe: timeframe,
					all: true
				});

				new newsletterViews.NewslettersListView(nls, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleNewsletter: function(name) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var nl = new newsletterModels.NewsletterInfo({
					id: name.split('?')[0],
					timeframe: timeframe,
				});

				new newsletterViews.NewsletterView(nl, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleBlogs: function(timeframe) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var blogs = new blogModels.BlogSummaries([], {
					timeframe: timeframe.split('?')[0],
					all: true
				});

				var bView = new blogViews.BlogsListView(blogs, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleBlog: function(name) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var blog = new blogModels.BlogInfo({
					id: name.split('?')[0],
					timeframe: timeframe
				});

				var bView = new blogViews.BlogView(blog, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleSections: function(timeframe) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var secs = new sectionModels.SectionSummaries([], {
					timeframe: timeframe.split('?')[0],
					all: true
				});

				new sectionViews.SectionsListView(secs, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleSection: function(name) {
			navView.setNav('articles', false);

			var articleTfView = new ArticleTimeframeView();

			var self = this;
			articleTfView.render(function() {

				timeframe = articleTfView.getAndSetTimeframe();

				var sec = new sectionModels.SectionInfo({
					id: name.split('?')[0],
					timeframe: timeframe
				});

				new sectionViews.SectionView(sec, function(el) {
					articleTfView.$el.find('#article-tracker-container').html(el);
					$("#content").html(articleTfView.el);
				});

			});
		},

		articleSearch: function(query) {
			navView.setNav('articles', false);
			var results = new articleSearchModels.SearchResults(query);

			var searchView = new articleSearchViews.SearchView(results, function(el) {
				$("#content").html(el);
			});
		}

	});

	var initialize = function() {
		templates.fetch('navbar', function() {
			this.router = new AppRouter();
			Backbone.history.start();
		});
	};
	return {
		initialize: initialize
	};
});

define([
	'jquery',
	'underscore'
], function($, _) {

	var templates = {

		cache: {},

		fetch: function(name, callback) {
			if (!this.cache[name]) {
				var tmpl_dir = window.version + '/html';
				var tmpl_url = tmpl_dir + '/' + name + '.html';
				var self = this;
				var tmpl_response;
				$.ajax({
					url: tmpl_url,
					method: 'GET',
					async: true,
					success: function(data) {
						self.cache[name] = _.template(data);
						callback(self.cache[name]);
					}
				});
			} else {
				callback(this.cache[name]);
			}
		},

		render: function(name, data, callback) {
			this.fetch(name, function(template) {
				callback(template(data));
			});
		}

	};

	return templates;
});

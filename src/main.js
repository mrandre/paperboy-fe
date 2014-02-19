require.config({
	paths: {
		jquery: 'vendor/jquery.min',
		bootstrap: 'vendor/bootstrap',
		underscore: 'vendor/underscore-min',
		backbone: 'vendor/backbone-min',
		datatables: 'vendor/jquery.dataTables.min',
        tabletools: 'vendor/TableTools', 
        zeroclipboard: 'vendor/ZeroClipboard',
        chartExport: 'vendor/exporting',
		eventie: 'vendor/eventie',
		eventEmitter: 'vendor/EventEmitter.min',
		imagesLoaded: 'vendor/imagesloaded.min',
		qtip: 'vendor/jquery.qtip.min',
		xdr: 'vendor/jquery.xdomainrequest.min',
		highcharts: 'vendor/highcharts',
        datepicker: 'vendor/bootstrap-datepicker',
        select2: 'vendor/select2.min',
		app: 'app',
		templates: 'templates'
	},
	shim: {
		'jquery': {
			exports: '$'
		},
		'bootstrap': {
			deps: ['jquery']
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'datatables': {
			deps: ['jquery']
		},
        'tabletools': {
            deps: ['jquery', 'datatables', 'zeroclipboard']
        },
        'zeroclipboard': {
            deps: ['jquery', 'datatables']
        },
		'highcharts': {
			deps: ['jquery']
		},
        'chartExport': {
            deps: ['highcharts']
        },
		'qtip': {
			deps: ['jquery']
		},
		'xdr': {
			deps: ['jquery']
		},
        'datepicker': {
            deps: ['bootstrap']
        },
        'select2': {
            deps: ['bootstrap']
        },
		'templates': {
			deps: ['underscore', 'jquery'],
			exports: 'templates'
		}
	}
});

require([
	'app',
	'xdr'
], function(App, xdr) {
	App.initialize();
});

// FOR ARTICLES
window.AddGetSortParam = function(url) {
	var sort = $('#sort').val();
	if (!sort) {
		sort = "clicks";
	}
	var sortParam = "sort=" + sort;
	if (url.indexOf('?') == -1) {
		sortParam = '?' + sortParam;
	} else {
		sortParam = "&" + sortParam;
	}

	return url + sortParam;
}

window.formatFormDate = function(t) {
    var day = t.getDate();
    if(day < 10){
        day = "0"+day;
    }
    var month = t.getMonth()+1;
    if(month < 10){
        month = "0"+month;
    }
    return t.getFullYear()+"-"+month+"-"+day;

}

window.formatDate = function(t) {
    return t.split('T')[0]; 
}

window.formatDateTime = function(t){
    var dateVals = t.split('T');
    return dateVals[0] + ' ('+dateVals[1].substring(0, dateVals[1].length -1)+')';
}

window.numberWithCommas = function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

window.altChartColors = [
   '#2f7ed8',
   '#0da39a',
   '#fa9a20',
   '#1aadce',
   '#492970',
   '#f28f43',
   '#77a1e5',
   '#8925f5',
   '#96c9ff'
]

window.daysOfTheWeek = {
    1:"SUN",
    2:"MON",
    3:"TUES",
    4:"WED",
    5:"THUR",
    6:"FRI",
    7:"SAT"
}; 

window.dayOfWeek = function(dayInt) {
    return window.daysOfTheWeek[dayInt];
}

window.cleanNewsletterName = function(name) {
	if (name == 'eta') {
		name = 'Email This Article';
	} else if (name == 'my_alerts_email') {
		name = 'My Alerts';
	} else {
		name = name.replace(' (DO NOT EDIT)', '');
	}

	return name;
}

// Take an array of strings, and return the int version. This is 
// shorthand for taking HTML numbers from a select box, etc. and 
// converting to a JSON array ready for Go (which has strict typing
// and "1" is not the same as 1).
window.stringsToInts = function(strings) {
    var results = [];

    if (strings == null) {
        return results;
    }

    var stop = strings.length;
    for (var i = 0; i < stop; i++) {
        results.push(parseInt(strings[i]));
    }

    return results;
}

// FIXME: this is not the best way to do this
switch (window.location.hostname) {
    case 'paperboy-admin.dev.ewr1.nytimes.com':
        window.api_host = 'https://paperboy-api.dev.ewr1.nytimes.com/';
        break;
    case 'b-fe.dev.ewr1.nytimes.com':
        window.api_host = 'https://b-api.dev.ewr1.nytimes.com/';
        break;
    case 'j-fe.dev.ewr1.nytimes.com':
        window.api_host = 'https://j-api.dev.ewr1.nytimes.com/';
        break;
    case 'paperboy-admin.stg.sea1.nytimes.com':
        window.api_host = 'https://paperboy-api.stg.sea1.nytimes.com/';
        break;
    case 'paperboy-admin.stg.ewr1.nytimes.com':
        window.api_host = 'https://paperboy-api.stg.ewr1.nytimes.com/';
        break;
    case 'paperboy-admin.prd.sea1.nytimes.com':
        window.api_host = 'https://paperboy-api.sea1.nytimes.com/';
        break;
    case 'paperboy-admin.prd.ewr1.nytimes.com':
        window.api_host = 'https://paperboy-api.ewr1.nytimes.com/';
        break;
    default: 
        window.api_host = 'https://paperboy-api.dev.ewr1.nytimes.com/';
}
window.api_host += 'svc/paperboy-api/v1/'


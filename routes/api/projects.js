var async = require('async'),
	keystone = require('keystone');

var Projects = keystone.list('Project');

/**
 * List Projects
 */
exports.list = function(req, res) {
	Projects.model.find(function(err, items) {
		
		if (err) return res.apiError('database error', err);
		
		res.apiResponse({
			projects: items
		});
		
	});
}

/**
 * Get Projects by ID
 */
exports.get = function(req, res) {
	Projects.model.findById(req.params.id).exec(function(err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		res.apiResponse({
			projects: item
		});
		
	});
}


/**
 * Create a Projects
 */
exports.create = function(req, res) {
	
	var item = new Projects.model(),
		data = (req.method == 'POST') ? req.body : req.query;
	
	item.getUpdateHandler(req).process(data, function(err) {
		
		if (err) return res.apiError('error', err);
		
		res.apiResponse({
			projects: item
		});
		
	});
}

/**
 * Get Projects by ID
 */
exports.update = function(req, res) {
	Projects.model.findById(req.params.id).exec(function(err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		var data = (req.method == 'POST') ? req.body : req.query;
		
		item.getUpdateHandler(req).process(data, function(err) {
			
			if (err) return res.apiError('create error', err);
			
			res.apiResponse({
				projects: item
			});
			
		});
		
	});
}

/**
 * Delete Projects by ID
 */
exports.remove = function(req, res) {
	Projects.model.findById(req.params.id).exec(function (err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		item.remove(function (err) {
			if (err) return res.apiError('database error', err);
			
			return res.apiResponse({
				success: true
			});
		});
		
	});
}
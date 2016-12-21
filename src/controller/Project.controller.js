const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ProjectService = require('../service/Project.service');

/************************************
 ** CONTROLLER:   ProjectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:03:22 PM
 *************************************/

// Get project short information
server.get('/Project', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await ProjectService.find({
			where: where,
			fields: {accounts: 0, roles: 0}
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Get project details information
server.get('/Project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ProjectService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Create new project
server.post('/Project', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;

		const rs = await ProjectService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Update project
server.put('/Project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;

		const rs = await ProjectService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Remove project
server.del('/Project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ProjectService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})
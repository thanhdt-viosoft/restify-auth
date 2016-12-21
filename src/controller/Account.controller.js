const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const AccountService = require('../service/Account.service');

/************************************
 ** CONTROLLER:   AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

// server.get('/Account', utils.jsonHandler(), async(req, res, next) => {
// 	try {
// 		let where = {};

// 		const rs = await AccountService.find({
// 			where: where
// 		});
// 		res.send(rs);
// 	} catch (err) {
// 		next(err);
// 	}
// });

// Get account details
// server.get('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
// 	try {
// 		const rs = await AccountService.get(req.params._id);
// 		res.send(rs);
// 	} catch (err) {
// 		next(err);
// 	}
// });

// My information
server.get('/Me', utils.jsonHandler(), async(req, res, next) => {
	try {
		const [projectId, token] = req.headers.token.split('-');
		const rs = await AccountService.getMe(token);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Check author
server.head('/Authoriz', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.authoriz(req.headers.token, req.headers.path, req.headers.actions.split(','));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Check login
server.head('/Login', utils.jsonHandler(), async(req, res, next) => {
	try {
		const token = await AccountService.login(req.headers.pj, req.headers.username, req.headers.password);
		res.header('token', token);
		res.end();
	} catch (err) {
		next(err);
	}
});

// Create new account
server.post('/Account', utils.fileUploadHandler({
	avatar: {
		uploadDir: "assets/avatar/",
		multiples: false,
		httpPath: "/avatar/${filename}",
		resize: global.appconfig.app.imageResize.avatar
	}
}), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.email) === true) body.email = req.body.email;
		if (utils.has(req.body.birth_day) === true) body.birth_day = utils.date(req.body.birth_day);
		if (utils.has(req.file.avatar) === true) body.avatar = req.file.avatar;
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;

		const rs = await AccountService.insert(body, req.headers.pj);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Update role for account
server.put('/Account/:accountId/Role', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;

		const rs = await AccountService.updateRole(req.headers.pj, req.params.accountId, req.body.roles);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Account/:_id', utils.fileUploadHandler({
	avatar: {
		uploadDir: "assets/avatar/",
		multiples: false,
		httpPath: "/avatar/${filename}",
		resize: global.appconfig.app.imageResize.avatar
	}
}), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.email) === true) body.email = req.body.email;
		if (utils.has(req.body.birth_day) === true) body.birth_day = utils.date(req.body.birth_day);
		if (utils.has(req.file.avatar) === true) body.avatar = req.file.avatar;

		const rs = await AccountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.delete(req.headers.pj, req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})
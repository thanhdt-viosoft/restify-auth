const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const MemcachedService = require('./Memcached.service');

/************************************
 ** SERVICE:      AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "Project",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,

		UPDATE_ROLE: 5
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.username = utils.valid('username', item.username, String);
				item.password = utils.valid('password', item.password, String);
				item.status = utils.valid('status', item.status, Number, 0);
				item.email = utils.valid('email', item.email, String);
				item.roles = utils.valid('roles', item.roles, Array);
				item.birth_day = utils.valid('birth_day', item.birth_day, Date);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, String));
				item.status = utils.valid('status', item.status, Number, 0);
				item.email = utils.valid('email', item.email, String);
				item.birth_day = utils.valid('birth_day', item.birth_day, Date);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.projectId = db.uuid(utils.valid('projectId', item.projectId, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.projectId = db.uuid(utils.valid('projectId', item.projectId, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async getMe(token, dboReuse) {
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				'accounts.token': db.uuid(token)
			}, {
				'accounts.$': 1,
			});
		}, dboType);
		const me = rs.accounts.length === 1 ? rs.accounts[0] : null;
		delete me.token;
		delete me.roles;
		delete me.password;
		delete me._id;
		return me;
	},

	async login(projectId, username, password){
		try {
			// TODO: exports.validate(item, exports.VALIDATE.UPDATE_ROLE);
			const dbo = await db.open(exports.COLLECTION);
			return projectId + "-" + await dbo.manual(async (collection, dbo) => {
				const token = db.uuid();
				const rs = await collection.update({
					_id: db.uuid(projectId),
					'accounts.username': username,
					'accounts.password': password
				}, {
					$set: {
						'accounts.$.token': token
					}
				});
				if(rs.result.n > 0) return token;
				throw new restify.ForbiddenError("Username or password is wrong");
			});
		} catch (err) {
			throw err;
		}
	},

	async updateRole(projectId, accountId, roles, dboReuse) {
		try {
			// TODO: exports.validate(item, exports.VALIDATE.UPDATE_ROLE);

			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			roles = await dbo.manual(async (collection, dbo) => {
				await collection.update({
					_id: db.uuid(projectId),
					'accounts._id': db.uuid(accountId)
				}, {
					$set: {
						'accounts.$.roles': roles
					}
				}, false, true);
				return roles;
			});
			return roles;
		} catch (err) {
			throw err;
		}
	},

	async getAccountCached(token){
		let account = await MemcachedService.get(`account.${token}`);
		if(!account){
			account = await MemcachedService.set(`account.${token}`, await exports.getByToken(token), 300);
		}else{
			await MemcachedService.touch(`account.${token}`, 300);
		}
		return account;
	},

	async authoriz(rawToken, path, actions){
		if(!rawToken) throw new restify.ProxyAuthenticationRequiredError();
		const [projectId, token] = rawToken.split('-');
		const roles = global.PROJECT_ROLEs[projectId];
		if(!roles) throw new restify.ForbiddenError('Could not found the project');
		const acc = await exports.getAccountCached(token);
		for(let accRole of acc.roles){
			const role = roles[accRole];
			if(!role) throw new restify.ForbiddenError(`Not found ${accRole} in global roles`);
			for(let auth of role){
				if(new RegExp(auth.path, 'gi').test(path) && _.some(actions, (a) => {
					return 	auth.actions.includes(a);
				})){
					return;
				}
			}	
		}
		throw new restify.UnauthorizedError('Not allow');
	},

	async getByToken(token) {
		const dbo = await db.open(exports.COLLECTION);
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				'accounts.token': db.uuid(token)
			}, {
				'accounts.$': 1
			});
		});
		return (rs && rs.accounts && rs.accounts.length === 1) ? rs.accounts[0] : null;
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(projectId0, _id0, dboReuse) {
		const {_id, projectId} = exports.validate({_id: _id0, projectId: projectId0}, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				_id: db.uuid(projectId),
				'accounts._id': _id
			}, {
				'accounts.$.roles': 1
			}, dboType);
		});
		return rs.accounts.length === 1 ? rs.accounts[0] : null;
	},

	async insert(item, projectId, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);
		const projectService = require('./Project.service');
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		
		const account = await projectService.getAccount(projectId, item.username, dbo);
		if(account){
			throw 'Existed account';
		}
		item = await projectService.addAccount(projectId, item, dbo);
		await dbo.close();
		return item;
	},

	

	async update(item, dboReuse) {
		try {
			item = exports.validate(item, exports.VALIDATE.UPDATE);

			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const oldItem = await dbo.get(item._id, db.FAIL);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			const rs = await dbo.update(item, dboType);

			utils.deleteFile(utils.getAbsoluteUpload(oldItem.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

			return rs;
		} catch (err) {
			utils.deleteFile(utils.getAbsoluteUpload(item.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

			throw err;
		}
	},

	async delete(projectId0, _id0, dboReuse) {
		const {projectId, _id} = exports.validate({projectId: projectId0, _id: _id0}, exports.VALIDATE.DELETE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const item = await dbo.get(projectId, _id, db.FAIL);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.update({
				_id: projectId,
			}, {
				$pull: {
					accounts: { 
						_id : _id 
					}
				}
			});
		}, dboType);

		utils.deleteFile(utils.getAbsoluteUpload(item.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

		return rs;
	}

};
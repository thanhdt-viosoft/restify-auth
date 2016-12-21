const restify = require('restify');
const path = require('path');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ProjectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:03:22 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "Project",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,

		ADD_ACCOUNT: 5,
		ADD_ROLE: 6
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.name = utils.valid('name', item.name, String);
				item.status = utils.valid('status', item.status, Number);
				item.roles = utils.valid('roles', item.roles, Object);
				item.created_at = new Date();
				item.updated_at = new Date();
				item.accounts = [];

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, String));
				item.name = utils.valid('name', item.name, String);
				item.status = utils.valid('status', item.status, Number);
				item.roles = utils.valid('roles', item.roles, Object);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item._id = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:

				break;

			case exports.ADD_ACCOUNT:
				item._id = db.uuid();
				break;

			case exports.ADD_ROLE:

				break;
		}
		return item;
	},

	async reloadInit() {
		global.PROJECT_ROLEs = {};
		const dbo = await db.open(exports.COLLECTION);
		const rs = await dbo.find({
			where: {
				status: 1
			},
			fields: {
				_id: 1,
				roles: 1
			}
		});
		for(let pj of rs){
			global.PROJECT_ROLEs[pj._id] = pj.roles;
		}
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async getAccount(_id, username, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const account = dbo.find({
			where: {
				'accounts.username': username
			}
		}, dboType);
		if (account && account.length === 1) return account;
		return null;
	},

	async addAccount(projectId, account, dboReuse) {
		exports.validate(account, exports.VALIDATE.ADD_ACCOUNT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		await dbo.manual(async(collection, dbo) => {
			await collection.update({
				_id: db.uuid(projectId)
			}, {
				$push: {
					'accounts': account
				}
			}, dboType);
		});

		return account;
	},

	async addRoles(projectId, accountId, roles, dboReuse) {
		exports.validate(account, exports.VALIDATE.ADD_ROLE);

		const accountService = require('./Account.service');
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		account = await accountService.updateRole(projectId, accountId, roles, dbo);
		await dbo.close();
		return account;
	},

	async get(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.get(_id, dboType);
		return rs;
	},

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(_id, dboReuse) {
		item = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(_id, dboType);

		return rs;
	}

};

exports.reloadInit();
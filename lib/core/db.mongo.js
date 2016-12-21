const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

/************************************
 ** DATABASE ADAPTER FOR MONGODB
 ** Installation
 ** `npm install mongodb --save`
 *************************************/
exports = module.exports = {
    DONE: 0,
    SUCCESS: 1,
    FAIL: -1,
    Uuid: ObjectID,
    uuid(id) {
        if(!id) return new ObjectID();
        return typeof id === 'string' ? ObjectID(id) : id;
    },
    async open(collection) {
        const func = {
            db: await MongoClient.connect(global.appconfig.db.url),
            collection: collection,
            async find({
                count,
                aggregate,
                where,
                fields,
                sort,
                page = 1,
                recordsPerPage = 20
            }, opts = exports.DONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                let query;
                if (aggregate) {
                    if (where) aggregate.splice(0, 0, {
                        $match: where
                    });
                    if (sort) aggregate.push({
                        $sort: sort
                    });
                    if (page) aggregate.push({
                        $skip: (page - 1) * recordsPerPage
                    });
                    if (recordsPerPage) aggregate.push({
                        $limit: recordsPerPage
                    });
                    query = collection.aggregate(aggregate);
                } else if (count) {
                    try {
                        const rs = await collection.count(where);
                        if (closeMode === exports.SUCCESS) await func.close();
                        return rs;
                    } catch (e) {
                        if (closeMode === exports.FAIL) await func.close();
                        throw e;
                    } finally {
                        if (closeMode === exports.DONE) await func.close();
                    }
                    return;
                } else {
                    query = collection.find(where, fields);
                    if (sort) query = query.sort(sort);
                    if (page) query = query.skip((page - 1) * recordsPerPage);
                    if (recordsPerPage) query = query.limit(recordsPerPage);
                }
                try {
                    const rs = await query.toArray();
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async get(_id, opts = exports.DONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.findOne({
                        _id: exports.uuid(_id)
                    });
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async insert(obj, opts = exports.DONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.insertOne(obj);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return obj instanceof Array ? rs.ops : rs.ops.length === 1 ? rs.ops[0] : null;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async manual(fcManual, opts = exports.DONE){
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await fcManual(collection, func);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async manual(fcManual, opts = exports.DONE){
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await fcManual(collection, func);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async manual(fcManual, opts = exports.DONE){
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await fcManual(collection, func);
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async update(obj0, opts = exports.DONE) {
                const obj = _.cloneDeep(obj0);
                delete obj._id;
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.updateOne({
                        _id: exports.uuid(obj0._id)
                    }, {
                        $set: obj
                    });
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async delete(_id, opts = exports.DONE) {
                const closeMode = opts.close || opts;
                const collection = func.db.collection(opts.collection || func.collection);
                try {
                    const rs = await collection.deleteOne({
                        _id: exports.uuid(_id)
                    });
                    if (closeMode === exports.SUCCESS) await func.close();
                    return rs;
                } catch (e) {
                    if (closeMode === exports.FAIL) await func.close();
                    throw e;
                } finally {
                    if (closeMode === exports.DONE) await func.close();
                }
            },
            async close() {
                if (func.db) {
                    await func.db.close();
                    delete func.db;
                }
                await Promise.all([]);
            }
        };
        return func;
    }
}
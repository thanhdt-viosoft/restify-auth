const Memcached = require('memcached');
const memcached = new Memcached('localhost:11211');
const _ = require("lodash");

exports = module.exports = {
    get(key){
        return new Promise((resolve, reject) => {
            memcached.get(key, (err, data) => {
                if(err) return reject(err);
                resolve(data)
            }) 
        });
    },
    set(key, value, lifetime=30000){
        return new Promise((resolve, reject) => {
            memcached.set(key, value, lifetime, (err, data) => {
                if(err) return reject(err);
                resolve(value)
            }) 
        });
    },
    touch(key, lifetime=30000){
        return new Promise((resolve, reject) => {
            resolve()
            // memcached.touch(key, lifetime, (err, data) => {
            //     if(err) return reject(err);
            //     resolve(value)
            // }) 
        });
    }
}
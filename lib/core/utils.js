const restify = require('restify');
const path = require('path');
const fs = require('fs');
const uuid = require('node-uuid');
const _ = require('lodash');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = {
    uuid() {
        return uuid.v4();
    },
    date(date) {
        if (exports.has(date) !== true || date instanceof Date) return date;
        return new Date(date);
    },
    boolean(bol) {
        return bol;
    },
    object(object) {
        if(_.isNil(object)) return object;
        if (typeof object === 'string') {
            object = JSON.parse(object);
        }
        _.forOwn(object, (props, fieldName) => {
            if(typeof props === 'object'){
                object[fieldName] = exports.object(object[fieldName]);
            }else if(typeof props === 'string' && /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}Z$/.test(props)){
                object[fieldName] = exports.date(object[fieldName]);
            }
        });
        return object;
    },
    is(params, type) {
        if(type instanceof Array){
            const msgs = [];
            for(var e of type){
               let msg;
               if((msg = exports.is(params, e)) === true) return true;
               msgs.push(msg);
            }
            return msgs.join(' or ');
        }else{
            if (Number === type && isNaN(params) === true) return 'must be Number type';
            else if (Date === type && !(params instanceof Date)) return 'must be Date type';
            else if (Boolean === type && _.isBoolean(params) !== true) return 'must be Boolean type';
            else if (Array === type && _.isArray(params) !== true) return 'must be Array type';
            else if (Object === type && _.isPlainObject(params) !== true) return 'must be Object type';
            else if (String === type && _.isString(params) !== true) return 'must be String type';
            return true;
        }
    },
    valid(fieldName, params, type, defaultValue) {
        let msg;
        let value = params;
        if ((msg = exports.has(value)) !== true) {
            if (!_.isNil(defaultValue)) value = defaultValue;
            else throw new restify.BadRequestError(`${fieldName} ${msg}`);
        }
        if (type && (msg = exports.is(value, type)) !== true) throw new restify.BadRequestError(`${fieldName} ${msg}`);
        return value;
    },
    has(params, type) {
        if (_.isNil(params)) return 'is required';
        if (type) {
            const msg = exports.is(params, type);
            if (msg !== true) return msg;
        }
        return true;
    },
    jsonHandler(config) {
        return restify.bodyParser(config);
    },
    resizeImage({
        buf,
        file
    }, sizes) {
        return new Promise(async(resolve, reject) => {
            try {
                const Jimp = require('jimp');
                if (!(sizes instanceof Array)) sizes = [sizes];
                const resize = sizes.map(async(size) => {
                    if (!size.w && !size.h) throw 'Need enter size to resize image';
                    const fileout = file.substr(0, file.lastIndexOf('.')) + (size.ext ? ('.' + size.ext) : '') + file.substr(file.lastIndexOf('.'));
                    let image = await Jimp.read(buf);
                    if (size.h < 0) {
                        size.h = Math.abs(size.h);
                        size.h = image.bitmap.height > size.h ? size.h : image.bitmap.height;
                    }
                    if (size.w < 0) {
                        size.w = Math.abs(size.w);
                        size.w = image.bitmap.width > size.w ? size.w : image.bitmap.width;
                    }
                    if (!size.w) size.w = size.h * image.bitmap.width / image.bitmap.height;
                    if (!size.h) size.h = size.w * image.bitmap.height / image.bitmap.width;
                    if (size.ratio) {
                        size.w *= size.ratio;
                        size.h *= size.ratio;
                    }
                    image = await image.cover(size.w, size.h).quality(size.quality || 100).write(fileout);
                    image = null;
                    exports.gc();
                    return fileout;
                });
                const rs = await Promise.all(resize);
                resolve(rs);
            } catch (err) {
                reject(err);
            } finally {
                exports.gc();
            }
        });
    },
    gc() {
        if (global.gc) {
            global.gc();
        } else {
            console.log('Pass --expose-gc when launching node to enable forced garbage collection.');
        }
    },
    fileUploadHandler(config) {
        let baseConfig = {
            uploadDir: "assets/upload/",
            httpPath: "/upload/${filename}",
            resize: undefined,
            mapFiles: false,
            mapParams: false,
            keepExtensions: false,
            multiples: false,
            multipartFileHandler(part, req) {
                const defaultConfig = _.clone(config[part.name]);
                const filename = exports.uuid() + (part.filename.indexOf('.') !== -1 ? part.filename.substr(part.filename.lastIndexOf('.')) : '');
                const fileout = path.join(defaultConfig.uploadDir, filename);
                let buf = new Buffer(0);
                // const stream = fs.createWriteStream(fileout, {
                //     defaultEncoding: 'binary',
                //     flags: 'w'
                // });
                part.on('data', (data) => {
                    buf = Buffer.concat([buf, data]);
                })
                part.on('end', async () => {
                    fs.writeFileSync(fileout, buf, 'binary');
                    if (!req.file[part.name]) req.file[part.name] = defaultConfig.multiples ? [] : {};
                    if (req.file[part.name] instanceof Array) req.file[part.name].push(defaultConfig.httpPath.replace('${filename}', filename));
                    else req.file[part.name] = defaultConfig.httpPath.replace('${filename}', filename);
                    if (defaultConfig.resize) {
                        try {
                            let rs = await exports.resizeImage({
                                buf: fileout,
                                file: fileout
                            }, defaultConfig.resize);
                            // Done
                        } catch (err) {
                            exports.deleteFile(fileout, defaultConfig.resize);
                            console.error('RESIZE', err);
                        }
                    }
                });
                // stream.on('close', async() => {
                //     if (defaultConfig.resize) {
                //         try {
                //             let rs = await exports.resizeImage({
                //                 buf: fileout,
                //                 file: fileout
                //             }, defaultConfig.resize);
                //             // Done
                //         } catch (err) {
                //             exports.deleteFile(fileout, defaultConfig.resize);
                //             console.error('RESIZE', err);
                //         }
                //     }
                // });
                // part.pipe(stream);
            }
        };
        if (config instanceof Object) {
            baseConfig = _.extend(baseConfig, config[Object.keys(config)[0]]);
            if (baseConfig.uploadDir) baseConfig.uploadDir = path.join(__dirname, '..', '..', baseConfig.uploadDir);
        } else {
            baseConfig.uploadDir = path.join(__dirname, '..', '..', config);
        }
        return [(req, res, next) => {
            if (!req.file) req.file = {};
            next();
            
        }, ...restify.bodyParser(baseConfig)];
    },
    getAbsoluteUpload(files, rootPath) {
        if (!files) return files;
        this.getPath = (f) => {
            return path.join(rootPath, f.substr(f.lastIndexOf('/') + 1));
        };
        if (!(files instanceof Array)) {
            return this.getPath(files);
        }
        return files.map((f) => {
            return this.getPath(f);
        });

    },
    deleteFile(files, sizes) {
        if (!files) return;
        const remove = (f, sizes) => {
            try {
                fs.statSync(f);
                fs.unlinkSync(f);
            } catch (e) { /*File was removed before that*/ }
            if (sizes) {
                sizes.forEach((s) => {
                    remove(f.substr(0, f.lastIndexOf('.')) + '.' + s.ext + f.substr(f.lastIndexOf('.')));
                });
            }
        };
        if (!(files instanceof Array)) {
            return remove(files, sizes);
        }
        files.forEach((f) => {
            remove(f, sizes);
        });
    }
}
let _ = require('lodash');

require('./gen.declare');
let config = require('./initial');
let genController = require('./gen.controller');
let genService = require('./gen.service');
let genHttp = require('./gen.http');

_.forOwn(config.tables, (props, tblName) => {
    let fieldsType = new MyArray();
    let fieldsKeyType;
    _.forOwn(props, (fieldType, fieldName) => {
        if(!fieldType.prototype){
            fieldType = Reflect.apply(fieldType, undefined, []);
        }
        fieldType.gen(fieldName);
        fieldsType.push(fieldType);
        if(fieldType.name === 'Key'){
            fieldsKeyType = fieldType;
        }
    });
    genController(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genService(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genHttp(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
});
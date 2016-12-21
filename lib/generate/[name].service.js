const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
** SERVICE:      ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

exports = module.exports = {    
    COLLECTION: "${tbl}",
    VALIDATE: {
        INSERT: 0,
        UPDATE: 1,
        GET: 2,
        DELETE: 3,
        FIND: 4,
    },
    ${GEN_CONTENT}
    
}
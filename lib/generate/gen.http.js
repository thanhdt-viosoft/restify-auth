let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.writeTo = (outdir) => {
        let insertFields = new MyArray();
        let updateFields = new MyArray();
        let contentType = 'application/json';
        fieldsType.forEach((fieldType, i) => {
           if(fieldType.name !== 'Key'){
                insertFields.push(fieldType.inHttp);
                updateFields.push(fieldType.upHttp);
            }
            if(fieldType.name === 'File') contentType = 'multipart/form-data';
        });
        insertFields = insertFields.join(',\n\t\t');
        updateFields = updateFields.join(',\n\t\t');
        let fhttp = path.join(__dirname, '..', '..', outdir, 'test', `${tbl}.http.js`);
        try {
            fs.statSync(fhttp);
            console.warn(`#WARN\t${fhttp} is existed`);
        } catch (e) {
            let appconfig = require('../../src/appconfig')
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].http.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{insertFields\}/g, insertFields)
                .replace(/\$\{updateFields\}/g, updateFields)
                .replace(/\$\{contentType\}/g, contentType)
                .replace(/\$\{port\}/g, appconfig ? appconfig.listen : 9000)
            let beautify = require('js-beautify').js_beautify;
            cnt = beautify(cnt.toString('binary'), { "indent_size": 1, "indent_char": "\t"});
            fs.writeFileSync(fhttp, cnt);
        }   
    }    
    return this;
}
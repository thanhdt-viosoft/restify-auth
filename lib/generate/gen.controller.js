let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.find = (fieldsKeyType, fieldsType) => {
        return `server.get('/${tbl}', utils.jsonHandler(), async (req, res, next) => {                    
                    try {
                        let where = {};

                        const rs = await ${tbl}Service.find({where: where});
                        res.send(rs);    
                    } catch (err) {
                        next(err);
                    }
                });`;
    };
    this.get = (fieldsKeyType, fieldsType) => {
        return `server.get('/${tbl}/:${fieldsKeyType.fieldName}', utils.jsonHandler(), async (req, res, next) => {
                    try {
                        const rs = await ${tbl}Service.get(${fieldsKeyType.sign}req.params.${fieldsKeyType.fieldName});
                        res.send(rs);
                    } catch (err) {
                        next(err);
                    }
                });`
    }
    this.post = (fieldsKeyType, fieldsType) => {
        let assignIValue = new MyArray();
        let jsonBodyParser = 'utils.jsonHandler()';
        let bodyFileParser = new MyArray();
        assignIValue.push(fieldsKeyType.assignInController);
        const bodyFileParserLoad = (fieldsType, isFirst) => {
            fieldsType.forEach((fieldType, i) => {
                if(fieldType.name !== 'Key'){
                    if(isFirst) assignIValue.push(fieldType.assignInController);
                    if(fieldType.declareMiddleInController){
                        bodyFileParser.push(fieldType.declareMiddleInController);
                    }
                    if(fieldType.schema) {
                        let fieldsType0 = []; 
                        _.forOwn(fieldType.schema, (props, fieldName) => {
                            fieldsType0.push(props);
                        });
                        bodyFileParserLoad(fieldsType0);
                    }
                }
            });    
        }
        bodyFileParserLoad(fieldsType, true);
        if(bodyFileParser.length > 0){
            
            jsonBodyParser = `utils.fileUploadHandler({
                                  ${bodyFileParser.join(',\n')}
                              })`;
        }        
        assignIValue = assignIValue.join('\n');
        return `server.post('/${tbl}', ${jsonBodyParser}, async (req, res, next) => {
                    try {
                        let body = {};
                        ${assignIValue}

                        const rs = await ${tbl}Service.insert(body);
                        res.send(rs);
                    } catch (err) {
                        next(err);
                    }
                })`;
    }
    this.put = (fieldsKeyType, fieldsType) => {
        let assignUValue = new MyArray();
        let jsonBodyParser = 'utils.jsonHandler()';
        let bodyFileParser = new MyArray();
        assignUValue.push(fieldsKeyType.assignUpController);
        const bodyFileParserLoad = (fieldsType, isFirst) => {
            fieldsType.forEach((fieldType, i) => {
                if(fieldType.name !== 'Key'){
                    if(isFirst) assignUValue.push(fieldType.assignUpController);
                    if(fieldType.declareMiddleInController){
                        bodyFileParser.push(fieldType.declareMiddleInController);
                    }
                    if(fieldType.schema) {
                        let fieldsType0 = []; 
                        _.forOwn(fieldType.schema, (props, fieldName) => {
                            fieldsType0.push(props);
                        });
                        bodyFileParserLoad(fieldsType0);
                    }
                }
            });    
        }
        bodyFileParserLoad(fieldsType, true);
        if(bodyFileParser.length > 0){
            jsonBodyParser = `utils.fileUploadHandler({
                                  ${bodyFileParser.join(',\n')}
                              })`;
        }                
        assignUValue = assignUValue.join('\n\t');
        return `server.put('/${tbl}/:${fieldsKeyType.fieldName}', ${jsonBodyParser}, async (req, res, next) => {
                    try {
                        let body = {};
                        ${assignUValue}

                        const rs = await ${tbl}Service.update(body);
                        res.send(rs);
                    } catch (err) {
                        next(err);
                    }
                })`;
    }
    this.delete = (fieldsKeyType, fieldsType) => {
        return `server.del('/${tbl}/:${fieldsKeyType.fieldName}', utils.jsonHandler(), async (req, res, next) => {
                    try{
                        const rs = await ${tbl}Service.delete(${fieldsKeyType.sign}req.params.${fieldsKeyType.fieldName});
                        res.send(rs);
                    } catch (err) {
                        next(err);
                    }
                })`;
    }
    this.writeTo = (outdir) => {
        let genContent = new MyArray();    
        genContent.push(self.find(fieldsKeyType, fieldsType));
        genContent.push(self.get(fieldsKeyType, fieldsType));
        genContent.push(self.post(fieldsKeyType, fieldsType));
        genContent.push(self.put(fieldsKeyType, fieldsType));
        genContent.push(self.delete(fieldsKeyType, fieldsType));
        let fcontroller = path.join(__dirname, '..', '..', outdir, 'controller', `${tbl}.controller.js`);
        try {
            fs.statSync(fcontroller);
            console.warn(`#WARN\t${fcontroller} is existed`);
        } catch (e) {
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].controller.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{GEN_CONTENT\}/g, genContent.join('\n\n'))
                .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
                .replace(/\$\{createdDate\}/g, new Date().toLocaleString());            
            let beautify = require('js-beautify').js_beautify;
            cnt = beautify(cnt.toString('binary'), { "indent_size": 1, "indent_char": "\t"});
            fs.writeFileSync(fcontroller, cnt);
        }
    }
    return this;
}
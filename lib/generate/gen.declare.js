const fs = require('fs');
let path = require('path');
let _ = require('lodash');

JSON.ostringify = (a, b, c) => {
    if(_.isNil(a)) return a;
    return JSON.stringify(a, b, c).replace(/\"([^(\")"]+)\":/g, "$1:").replace(/"?\$Native\(([^\)]+)\)"?/g, '$1');
}
global.MyArray = class MyArray extends Array {
    push(data) {
        if (data !== undefined && data !== null) {
            super.push(data);
        }
    }
}
global.Native = (value) => {
    return `$Native(${value})`;
}
global.GenType = {
        Uuid(mode='db') {
            const Uuid = class Uuid {};
            Uuid.type = 'String';
            Uuid.mode = mode;
            return Uuid;
        },
        Key(type = GenType.Uuid('db'), defaultValue) {
            if(!type.prototype) type = Reflect.apply(type, undefined, []);
            let Key = class Key {};            
            Key.defaultValue = defaultValue;
            Key.sign = type.name === 'Number' ? '+' : '';            
            Key.gen = (fieldName) => {
                Key.fieldName = fieldName;
                Key.validateInService = (item) => {
                    if(type.mode === 'code') return `${item}.${fieldName} = utils.uuid();`;
                    else if(type.mode === 'db') return `${item}.${fieldName} = db.uuid();`;
                }
                Key.validateDeService = (item) => {
                    if(type.mode === 'code') return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}, ${type.type});`;
                    else if(type.mode === 'db') return `${item}.${fieldName} = db.uuid(utils.valid('${fieldName}', ${item}, ${type.type}));`;
                }
                Key.validateUpService = (item) => {
                    if(type.mode === 'code') return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, ${type.type});`;
                    else if(type.mode === 'db') return `${item}.${fieldName} = db.uuid(utils.valid('${fieldName}', ${item}.${fieldName}, ${type.type}));`;
                }
                Key.validateFiService = (item) => {
                    return null;
                };
                Key.validateGeService = (item) => {
                    if(type.mode === 'code') return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}, ${type.type});`;
                    else if(type.mode === 'db') return `${item}.${fieldName} = db.uuid(utils.valid('${fieldName}', ${item}, ${type.type}));`;
                }
                Key.upHttp = Key.inHttp = `${fieldName}: `;
                if (defaultValue === undefined) {

                } else if (defaultValue === null) {

                } else if ('uuid' === defaultValue) {
                    Key.assignInController = `body.${fieldName} = utils.uuid();`;
                }
                Key.assignUpController = `body.${fieldName} = ${Key.sign}req.params.${fieldName};`;

            }
            return Key;
        },
        String(defaultValue) {
            const String = class String {};
            String.defaultValue = defaultValue;
            String.gen = (fieldName) => {
                String.fieldName = fieldName;
                String.assignUpController = String.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    String.upHttp = String.inHttp = `${fieldName}: ''`;
                    String.validateUpService = String.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, String);`;
                    }
                } else if (defaultValue === null) {
                    String.upHttp = String.inHttp = `${fieldName}: null`;
                } else {
                    String.upHttp = String.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                    String.validateUpService = String.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, String, ${JSON.ostringify(defaultValue)});`;
                    }
                }

            }
            return String;
        },
        Number(defaultValue) {
            let Number = class Number {};
            Number.defaultValue = +defaultValue;
            Number.gen = (fieldName) => {
                Number.fieldName = fieldName;
                Number.assignUpController = Number.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = +req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    Number.upHttp = Number.inHttp = `${fieldName}: 0`;
                    Number.validateUpService = Number.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Number);`;
                    }
                } else if (defaultValue === null) {
                    Number.upHttp = Number.inHttp = `${fieldName}: null`;
                } else {
                    Number.upHttp = Number.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                    Number.validateUpService = Number.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Number, ${JSON.ostringify(defaultValue)});`;
                    }
                }

            }
            return Number;
        },
        Boolean(defaultValue) {
            let Boolean = class Boolean {};
            Boolean.defaultValue = +defaultValue;
            Boolean.gen = (fieldName) => {
                Boolean.fieldName = fieldName;
                Boolean.assignUpController = Boolean.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.boolean(req.body.${fieldName});`;
                if (defaultValue === undefined) {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: 0`;
                    Boolean.validateUpService = Boolean.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Boolean);`;
                    }
                } else if (defaultValue === null) {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: null`;
                } else {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                    Boolean.validateUpService = Boolean.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Boolean, ${JSON.ostringify(defaultValue)});`;
                    }
                }

            }
            return Boolean;
        },
        Date(...yyyy) {
            let Date = class Date {};
            let defaultValue = yyyy.length === 0 ? undefined : (yyyy[0] === null ? null : yyyy.join(','));
            if (!_.isNil(defaultValue)) {
                defaultValue = defaultValue === 'now' ? 'new Date()' : `new Date(${defaultValue})`;
            }
            Date.defaultValue = defaultValue;
            Date.gen = (fieldName) => {
                Date.fieldName = fieldName;
                Date.assignUpController = Date.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.date(req.body.${fieldName});`;
                if (defaultValue === undefined) {
                    Date.validateUpService = Date.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Date);`;
                    }
                    Date.upHttp = Date.inHttp = `${fieldName}: new Date()`;
                } else if (defaultValue === null) {
                    Date.upHttp = Date.inHttp = `${fieldName}: null`;
                } else {
                    Date.upHttp = Date.inHttp = `${fieldName}: ${defaultValue}`;
                    Date.validateUpService = Date.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Date, ${defaultValue});`;
                    }
                }

            }
            return Date;
        },
        Object(schema, defaultValue) {
            let Object = class Object {};
            Object.schema = schema;
            Object.defaultValue = defaultValue;
            Object.gen = (fieldName) => {
                Object.fieldName = fieldName;
                Object.assignUpController = Object.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.object(req.body.${fieldName});`;
                let checkWhenHas = (item, fieldName, type) => {
                    let rs = new MyArray();
                    _.forOwn(schema, (fieldType, fieldName1) => {
                        if (!fieldType.prototype) {
                            fieldType = Reflect.apply(fieldType, undefined, []);
                        }
                        fieldType.gen(fieldName1);
                        if(type === 0) {                            
                            rs.push(fieldType.validateInService ? fieldType.validateInService(`${item}.${fieldName}`) : null);
                        }
                        else {
                            rs.push(fieldType.validateUpService ? fieldType.validateUpService(`${item}.${fieldName}`) : null);
                        }
                    });
                    return `${rs.length > 0 ? `if(${item}.${fieldName}) {` : ''}
                                ${rs.join('\n')}
                            ${rs.length > 0 ? `}` : ''}`;
                }
                let assignPropsHttp = (type) => {
                    let rs = new MyArray();
                    _.forOwn(schema, (fieldType, fieldName1) => {
                        if (!fieldType.prototype) {
                            fieldType = Reflect.apply(fieldType, undefined, []);
                        }
                        fieldType.gen(fieldName1);
                        if(type === 0) {
                            rs.push(fieldType.inHttp);
                        }
                        else {
                            rs.push(fieldType.upHttp);
                        }
                    });
                    return `${rs.join('\n')}`;
                }
                if(!_.isNil(defaultValue)){
                    Object.upHttp = Object.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                }else {
                    Object.upHttp = `${fieldName}: {${assignPropsHttp(1)}}`;
                    Object.inHttp = `${fieldName}: {${assignPropsHttp(0)}}`;
                }
                if (defaultValue === undefined) {                    
                    const validate = (item, type) => {
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Object);`;
                        if (schema) cnt += `${checkWhenHas(item, fieldName, type)}`;
                        return cnt;
                    };
                    Object.validateUpService = (item) => {
                        return validate(item, 1);
                    };
                    Object.validateInService = (item) => {
                        return validate(item, 0);
                    };
                } else if (defaultValue === null) {
                    // Object.upHttp = Object.inHttp = `${fieldName}: null`;
                } else {                    
                    const validate = (item, type) => {
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Object, ${JSON.ostringify(defaultValue, null, '\t').replace(/\n/g, '\n')});`;
                        if (schema) cnt += `${checkWhenHas(item, fieldName, type)}`;
                        return cnt;
                    };
                    Object.validateUpService = (item) => {
                        return validate(item, 1);
                    };
                    Object.validateInService = (item) => {
                        return validate(item, 0);
                    };
                }

            }
            return Object;
        },
        Array(schema, defaultValue) {
            let Array = class Array {};
            Array.schema = schema;
            Array.defaultValue = defaultValue;
            Array.gen = (fieldName) => {
                const ijk = ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q'];
                Array.fieldName = fieldName;
                Array.assignUpController = Array.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.object(req.body.${fieldName});`;
                let checkWhenHas = (item, i, type) => {
                    let rs = new MyArray();
                    _.forOwn(schema, (fieldType, fieldName1) => {
                        if (!fieldType.prototype) {
                            fieldType = Reflect.apply(fieldType, undefined, []);
                        }
                        fieldType.gen(fieldName1);
                        if(type === 0) rs.push(fieldType.validateInService ? fieldType.validateInService(`${item}.${fieldName}[${ijk[i]}]`, i + 1) : null);
                        else rs.push(fieldType.validateUpService ? fieldType.validateUpService(`${item}.${fieldName}[${ijk[i]}]`, i + 1) : null);
                    });
                    return `${item}.${fieldName}.forEach((item${ijk[i]}, ${ijk[i]})=>{
                        ${rs.join('\n')}
                    });`;
                }
                let assignPropsHttp = (schema, type) => {
                    let rs = new MyArray();
                    _.forOwn(schema, (fieldType, fieldName1) => {
                        if (!fieldType.prototype) {
                            fieldType = Reflect.apply(fieldType, undefined, []);
                        }
                        fieldType.gen(fieldName1);
                        if(type === 0) {
                            rs.push(fieldType.inHttp);
                        }
                        else {
                            rs.push(fieldType.upHttp);
                        }
                    });
                    return `${rs.join('\n')}`;
                }
                if(!_.isNil(defaultValue)){
                    Array.upHttp = Array.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                }else {
                    Array.upHttp = `${fieldName}: [${assignPropsHttp(schema, 1)}]`;
                    Array.inHttp = `${fieldName}: [${assignPropsHttp(schema, 0)}]`;
                }
                if (defaultValue === undefined) {
                    const validate = (item, type, i) => {
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Array);`;
                        if (schema) cnt += `${checkWhenHas(item, i, type)}`;
                        return cnt;
                    }
                    Array.validateUpService = (item, i=0) => {
                        return validate(item, 1, i);
                    }
                    Array.validateInService = (item, i=0) => {
                        return validate(item, 0, i);
                    }
                    // Array.upHttp = Array.inHttp = `${fieldName}: []`;

                } else if (defaultValue === null) {
                    // Array.upHttp = Array.inHttp = `${fieldName}: null`;
                } else {
                    const validate = (item, type, i) => {
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Array, ${JSON.ostringify(defaultValue, null, '\t').replace(/\n/g, '\n')});`;
                        if (schema) cnt += `${checkWhenHas(item, i)}`;
                        return cnt;
                    }
                    Array.validateUpService = (item, i=0) => {
                        return validate(item, 1, i);
                    }
                    Array.validateInService = (item, i=0) => {
                        return validate(item, 0, i);
                    }
                    // Array.upHttp = Array.inHttp = `${fieldName}: ${JSON.ostringify(defaultValue)}`;
                }

            }
            return Array;
        },
        File(config, defaultValue) {
            let File = class File {};
            if (!config) throw 'Not config upload path yet';
            File.config = config;
            File.gen = (fieldName) => {
                    File.fieldName = fieldName;
                    let dir = path.join(__dirname, '..', '..', config.uploadDir);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    File.assignUpController = File.assignInController = `if(utils.has(req.file.${fieldName}) === true) body.${fieldName} = req.file.${fieldName};`;
                    if (defaultValue === undefined) {
                        File.validateUpService = File.validateInService = (item) => {
                            return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, ${config.multiples ? 'Array' : 'String'});`;
                        }
                        File.upHttp = File.inHttp = `'file:${fieldName}': ''`;
                    } else if (defaultValue === null) {
                        // File.validateUpService = File.validateInService = (item) => {`item.${fieldName} = item.${fieldName} || null;`;
                        File.upHttp = File.inHttp = `'file:${fieldName}': null`;
                    } else {
                        File.validateUpService = File.validateInService = (item) => {
                            return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, ${config.multiples ? 'Array' : 'String'}, ${JSON.ostringify(defaultValue)});`;
                        }
                        File.upHttp = File.inHttp = `'file:${fieldName}': ${defaultValue}`;
                    }
                    File.declareMiddleInController = `${fieldName}: ${Object.keys(config).length === 1 ? `'${config.uploadDir}'` : JSON.ostringify(config)}`;
            }
        return File;
    }
};
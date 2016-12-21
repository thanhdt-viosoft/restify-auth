const path = require('path');
module.exports = {
    tables: {
        Project: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String,
            status: GenType.Number,
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now'),
            accounts: GenType.Array({
                _id: GenType.Key(GenType.Uuid('db')),
                username: GenType.String,
                password: GenType.String,
                status: GenType.Number(0),
                email: GenType.String,
                birth_day: GenType.Date,
                avatar: GenType.File({uploadDir: 'assets/avatar/', multiples: false, "httpPath": "/avatar/${filename}", "resize": Native("global.appconfig.app.imageResize.avatar")}, null),
                created_at: GenType.Date('now'),
                updated_at: GenType.Date('now')
            })
        },
        Account: {
            _id: GenType.Key(GenType.Uuid('db')),
            username: GenType.String,
            password: GenType.String,
            status: GenType.Number(0),
            email: GenType.String,
            birth_day: GenType.Date,
            avatar: GenType.File({uploadDir: 'assets/avatar/', multiples: false, "httpPath": "/avatar/${filename}", "resize": Native("global.appconfig.app.imageResize.avatar")}, null),
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now')
        }
    },
    outdir: 'src'
};
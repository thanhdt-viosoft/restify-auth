let restify = require('restify');
let fs = require('fs');
let path = require('path');

/************************************
 ** SERVER LISTENER
 ** 
 *************************************/

global.appconfig = require('./src/appconfig');

global.server = restify.createServer();

server.use(restify.queryParser());
// server.use(restify.acceptParser(server.acceptable));
// server.use(restify.dateParser());
// server.use(restify.jsonp());
// server.use(restify.gzipResponse());
// server.use(restify.bodyParser());
// server.use(restify.requestExpiry());
// server.use(restify.conditionalRequest());
// server.use(restify.CORS());
// server.use(restify.fullResponse());

server.get(/\/images\/?.*/, restify.serveStatic({
  directory: './assets'
}));

server.use(restify.CORS());

server.opts(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});

fs.readdir(path.join(__dirname, 'src', 'controller'), function (err, files) {
    if (err) return console.error(err);
    files.forEach((file) => {
        if(file.indexOf('.js') != -1){
            require(`./src/controller/${file}`);
        } 
    });
});

server.listen(appconfig.listen, () => {
    console.info("Server is running at %d", appconfig.listen);
});
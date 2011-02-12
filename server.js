require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

////////////////////////////////////////////////////////////////////////////////////////////////

var http = require('http');
var fs = require('fs');
var ss = require('node-static');
var mongo = require('mongodb');

////////////////////////////////////////////////////////////////////////////////////////////////

try {
    var configJSON = fs.readFileSync(__dirname + "/app.json");
} catch(e) {
    console.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
}
var config = JSON.parse(configJSON.toString());

// reads argv, parses --option=value into {option: value}
var argvToObject = function(argv) {
    var obj = {};
    var regex = /\-\-(\w+)\=(.+)?/;
    for (var i = 0, l = argv.length, match; i < l; i++) {
        match = argv[i].match(regex);
        if (match) obj[match[1]] = match[2];
    }
    return obj;
};

var args = argvToObject(process.argv);
for (var a in args) {
    config[a] = args[a];
}

////////////////////////////////////////////////////////////////////////////////////////////////

var db;
var tasks = []; // they may depend on opened db connection
var runTasks = function() {
    for (var i=0; i<tasks.length; i++) {
        var task = tasks[i];
        if (task) task();
    }
};

if (config.landing) {
    tasks.push(function() {
        var file = new(ss.Server)(config.prefix + '/public');

        http.createServer(function(request, response) {
            request.addListener('end', function() {
                file.serve(request, response);
            });
        }).listen(config.landing_port);

        console.log('Landing page running at http://*:' + config.landing_port);
    });
}

if (config.mongo) {
    db = new mongo.Db('21days', new mongo.Server(config.mongo_host, config.mongo_port, {}), {});

    db.addListener("error", function(error) {
        console.log("Error connecting to mongo -- perhaps it isn't running?");
    });

    // if db is enabled run all tasks after we get proper connection
    db.open(function() {
        runTasks();
    });
} else {
    runTasks();
}
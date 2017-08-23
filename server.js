var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);

require('dotenv').config();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/stopwatch', function(req, res) {
    res.sendFile(path.join(__dirname + '/index_stopwatch.html'));
});

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/public', express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'production') {
    require('reload')(server, app);
}

server.listen(process.env.PORT, function () {
    console.log('Listening on port '.concat(process.env.PORT));
});

#!/usr/bin/env node
'use strict';

var http = require('http');
var parseUrl = require('url').parse;
var path = require('path');
var fs = require('fs');

function echo(request, response) {
  var data = {
    ip: request.connection.remoteAddress,
    method: request.method,
    url: request.url,
    body: '',
    headers: request.headers,
  };

  request.on('data', function appendData(buffer) {
    data.body += buffer.toString();
  });

  request.on('end', function sendResponse() {
    var body = JSON.stringify(data, null, 2);
    response.setHeader('Content-Type', 'application/json');
    response.end(body);
  });
}

function error(response) {
  response.statusCode = 500;
  response.end('500 SERVER ERROR');
}

function crash(response) {
  response.statusCode = 500;
  response.socket.destroy();
}

function serveFromDisk(pathname, response) {
  var safePath = pathname.replace(/\.\./g, '').replace(/^\/+/, '');
  if (safePath === '') safePath = 'index.html';
  var filePath = path.resolve(__dirname, 'public', safePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    response.setHeader('Content-Type', 'text/html');
    fs.createReadStream(filePath).pipe(response);
  } else {
    response.statusCode = 404;
    response.end('File Not Found');
  }
}

function createServer() {
  return http.createServer(function handleRequest(request, response) {
    var parsedUrl = parseUrl(request.url);
    switch (parsedUrl.pathname) {
      case '/echo':
        return echo(request, response);

      case '/error':
        return error(response);

      case '/crash':
        return crash(response);

      case '/blackhole':
        return undefined;

      default:
        return serveFromDisk(parsedUrl.pathname, response);
    }
  });
}

var testApp = module.exports = {
  listen: function listen(port, callback) {
    this.server = createServer();
    this.server.listen(port, callback);
  },

  kill: function kill(callback) {
    this.server.close(callback);
    this.server = null;
  },
};

if (module === require.main) {
  if (process.env.never_listen) {
    console.log('Refusing to listen');
    setTimeout(function noop() {}, 100000);
  } else {
    testApp.listen(process.env.PORT || 4003, function onListen() {
      console.log('Listening on port %j', this.address().port);
    });
  }
}

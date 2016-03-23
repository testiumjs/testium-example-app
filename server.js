#!/usr/bin/env node
'use strict';

var http = require('http');
var parseUrl = require('url').parse;

var StaticServer = require('node-static').Server;

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

function serveFromDisk(file, request, response) {
  var listener = request.addListener('end', function serveFile() {
    file.serve(request, response);
  });
  listener.resume();
}

function createServer() {
  var file = new StaticServer(__dirname + '/public');

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
        return serveFromDisk(file, request, response);
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

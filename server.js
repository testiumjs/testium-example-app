#!/usr/bin/env node

'use strict';

const http = require('http');
const parseUrl = require('url').parse;
const path = require('path');
const fs = require('fs');
const console = require('console');

function echo(request, response) {
  const data = {
    ip: request.connection.remoteAddress,
    method: request.method,
    url: request.url,
    body: '',
    headers: request.headers,
  };

  request.on('data', (buffer) => {
    data.body += buffer.toString();
  });

  request.on('end', () => {
    const body = JSON.stringify(data, null, 2);
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
  let safePath = pathname.replace(/\.\./g, '').replace(/^\/+/, '');
  if (safePath === '') safePath = 'index.html';
  const filePath = path.resolve(__dirname, 'public', safePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    let mimeType = 'text/html';
    if (filePath.endsWith('.js')) {
      mimeType = 'application/javascript';
    }
    response.setHeader('Content-Type', mimeType);
    fs.createReadStream(filePath).pipe(response);
  } else {
    response.statusCode = 404;
    response.end('File Not Found');
  }
}

function createServer() {
  return http.createServer((request, response) => {
    const parsedUrl = parseUrl(request.url);
    switch (parsedUrl.pathname) {
      case '/echo':
        return echo(request, response);

      case '/error':
        return error(response);

      case '/crash':
        return crash(response);

      case '/blackhole':
        return null;

      default:
        return serveFromDisk(parsedUrl.pathname, response);
    }
  });
}

const testApp = (module.exports = {
  listen: function listen(port, callback) {
    this.server = createServer();
    this.server.listen(port, callback);
  },

  kill: function kill(callback) {
    this.server.close(callback);
    this.server = null;
  },
});

if (module === require.main) {
  if (process.env.never_listen) {
    console.log('Refusing to listen');
    setTimeout(() => {}, 100000);
  } else {
    testApp.listen(process.env.PORT || 4003, function onListen() {
      console.log('Listening on port %j', this.address().port);
    });
  }
}

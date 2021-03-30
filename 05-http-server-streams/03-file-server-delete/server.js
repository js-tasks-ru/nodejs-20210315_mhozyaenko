const url = require('url');
const http = require('http');
const path = require('path');
const {unlink} = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Вложенные папки не поддерживаются');
      }

      unlink(filepath, (error) => {
        if (error && error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('Файл не найден');
        }
        if (error && error.code !== 'ENOENT') {
          res.statusCode = 500;
          res.end('Что-то пошло не так...');
        }
        if (!error) {
          res.statusCode = 200;
          res.end();
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

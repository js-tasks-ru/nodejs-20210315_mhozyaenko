const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

const {createReadStream} = require('fs');

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':

      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        res.end('Вложенные папки не поддерживаются');
      }

      const readStream = createReadStream(filepath);

      readStream.pipe(res);

      readStream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('Файл не найден');
        } else {
          res.statusCode = 500;
          res.end('Что-то пошло не так...');
        }
      });

      res.on('close', () => {
        if (res.finished) return;
        readStream.destroy();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

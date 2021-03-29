const url = require('url');
const http = require('http');
const path = require('path');
const {createWriteStream, unlink} = require('fs');
const LimitSizeStream = require('../../03-streams/01-limit-size-stream/LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Вложенные папки не поддерживаются');
      }

      const writeStream = createWriteStream(filepath, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({
        limit: 1024 * 1024,
        highWaterMark: 1024 * 1024 * 2,
      });

      req.pipe(limitedStream).pipe(writeStream);

      writeStream.on('error', (error) => {
        writeStream.destroy();
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('Файл уже существует');
        } else {
          res.statusCode = 500;
          res.end('Что-то пошло не так...');
        }
      });

      limitedStream.on('error', (error) => {
        writeStream.destroy();
        if (error.code === 'LIMIT_EXCEEDED') {
          unlink(filepath, () => {});
          res.statusCode = 413;
          res.end('Размер файла превышает 1МБ');
        } else {
          res.statusCode = 500;
          res.end('Что-то пошло не так...');
        }
      });

      writeStream.once('finish', () => {
        if (writeStream.bytesWritten > 0) {
          res.statusCode = 201;
          res.end('OK');
        }
      });

      res.on('close', () => {
        if (res.finished) return;
        unlink(filepath, () => {});
        res.destroy();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

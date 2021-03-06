const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');


const tplPath = path.join(__dirname, '../templates/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async function (req, res, filePath, config){
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);

      res.setHeader('Content-Type', contentType);

      // Read from cache
      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }

      //Read files or directory in  a range
      let rs;
      const {code, start, end} = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, {start, end});
      }

      // read a file
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      }
      rs.pipe(res);

    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      const dir = path.relative(config.root, filePath);
      const data = {
        title: path.basename(filePath),
        dir: dir ? '/'+ dir : '',
        files : files.map(file => {
          return {
            file,
            icon: mime(file)
          }
        })
      };
      res.end(template(data));
    }
  } catch  (ex) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    console.error('%s is not a directory or a file \n %s', filePath, ex.toString());
    res.end();
  }
}

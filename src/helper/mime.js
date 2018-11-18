const path = require('path');


const mimeTypes = {
  'css' : 'text/css',
  'gif' : 'image/gif',
  'html' : 'text/html',
  'jpeg' : 'image/jpeg',
  'jpg' : 'image/jpeg',
  'js' : 'application/json',
  'pdf' : 'application/pdf',
  'png' : 'image/png',
  'txt' : 'text/plain',
  'wma' : 'video/x-ms-wma',
  'avi' :	'video/avi',
};

module.exports = (filePath) => {
  let ext = path.extname(filePath)
    .split('.')
    .pop()
    .toLowerCase();
  if (!ext) {
    ext = filePath;
  }

  return mimeTypes[ext] || mimeTypes['txt'];
}

const simpleLogger = require('simple-node-logger');
const fs = require('fs');
const path = require('path');

const logFolderPath = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logFolderPath)) {
  fs.mkdirSync(logFolderPath);
}

const manager = simpleLogger.createLogManager();

const opts = {
  logDirectory: logFolderPath, // <ust exist and be writable
  fileNamePattern: '<DATE>.log',
  dateFormat: 'YYYY-MM-DD',
  timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};

manager.createRollingFileAppender(opts);

const log = manager.createLogger();

log.setLevel(process.env.LOGGER_LEVEL || 'error');

module.exports = log;
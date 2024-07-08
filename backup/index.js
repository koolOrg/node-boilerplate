const { exec } = require('child_process');
const { config } = require('dotenv');
const path = require('path');
const ENV_PATH = '../.env';
config({ path: ENV_PATH });
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const BACKUP_FOLDER = process.env.BACKUP_FOLDER || __dirname;
// Backup options
const DATE = new Date().toISOString().slice(0, 10).replace(/:/g, '-');
const BACKUP_FILE = path.join(BACKUP_FOLDER, `${DB_NAME}-${DATE}.sql`);
const cmd = `mysqldump -u ${USER} -p${PASSWORD} -h ${HOST} ${DB_NAME} > ${BACKUP_FILE}`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during backup: ${error.message}`);
    return;
  }
  exec(`gzip ${BACKUP_FILE}`, (gzipError) => {
    if (gzipError) {
      console.error(`Error during compression: ${gzipError.message}`);
      return;
    }
    console.log(`Backup successful: ${BACKUP_FILE}.gz`);
  });
});
//0 2 * * * /usr/bin/node /path/to/your/backup_mysql.js

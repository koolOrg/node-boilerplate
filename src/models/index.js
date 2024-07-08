import Sequelize from 'sequelize';
import { mysql } from '../config/config';
import path from 'node:path';
import fs from 'node:fs';

const loadModels = () => {
  let models = {};
  const modelDir = path.join(__dirname, 'schema');
  fs.readdirSync(modelDir).forEach((file) => {
    if (file === 'Base.js') return;
    if (!file.endsWith('.js')) return;
    const model = require(path.join(modelDir, file)).default;
    models[model.name] = model;
  });
  return models;
};
const models = loadModels();
const sequelize = new Sequelize(mysql.url, {
  dialect: 'mysql',
  logging: true,
  pool: {
    max: 10,
    min: 0,
    acquire: 200000,
    idle: 200000,
  },
});
Object.keys(models).forEach((x) => {
  models[x].init(sequelize);
});
Object.keys(models).forEach((x) => {
  models[x].associate(models);
});
let db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
Object.assign(db, models);
export default db;

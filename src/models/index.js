import Sequelize from 'sequelize';
import { config } from 'dotenv';
import User from './schema/User';
import Token from './schema/Token';

config();

const db = {};
const models = {
  User,
  Token,
};
const sequelize = new Sequelize(process.env.DB_URL, {
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;
Object.assign(db, models);
export default db;

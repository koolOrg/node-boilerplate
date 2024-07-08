import { Model } from 'sequelize';

export default class Base extends Model {
  static getAllWithPaging({ page, limit, where = {}, include = [], attributes, distinct = 'id', order = [] }) {
    const options = {
      order,
      where,
      include,
      attributes,
      distinct,
    };

    if (limit && page) {
      options.limit = +limit;
      options.offset = (+page - 1) * limit;
    }
    return this.findAndCountAll(options);
  }
}

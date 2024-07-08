import Sequelize from 'sequelize';
import Base from './Base';

export default class User extends Base {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }

  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fullname: {
          type: Sequelize.STRING,
        },
        email: {
          type: Sequelize.STRING,
        },
        phone: {
          type: Sequelize.STRING,
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        role: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'user',
        },
        is_super: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        type: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        modelName: 'User',
        freezeTableName: true,
        tableName: 'users',
        timestamps: true,
      },
    );
  }
}

import Sequelize from 'sequelize';
import Base from './Base';

export default class Token extends Base {
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
        token: {
          type: Sequelize.STRING,
        },
        user_id: Sequelize.INTEGER,
        type: Sequelize.STRING,
        blacklisted: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        modelName: 'Token',
        freezeTableName: true,
        tableName: 'tokens',
        timestamps: true,
      },
    );
  }
}

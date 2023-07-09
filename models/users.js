"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Posts, {
        sourceKey: "userId", // Users가 Posts에게 줄 컬럼
        foreignKey: "UserId", // 준 컬럼을 Posts의 어떤 컬럼과 연결시킬 것인지
      });
      this.hasMany(models.Comments, {
        sourceKey: "userId",
        foreignKey: "UserId",
      });
      this.hasMany(models.Likes, {
        sourceKey: "userId",
        foreignKey: "UserId",
      });
    }
  }
  Users.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};

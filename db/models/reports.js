'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  reports.init({
    name: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
    query: DataTypes.TEXT,
    options: DataTypes.TEXT,
    type: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    in_built: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'reports',
  });
  return reports;
};
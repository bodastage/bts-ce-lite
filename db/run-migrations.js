const { Sequelize } = require('sequelize');
const path = require('path');

const config = require('./config/config.json').development;
const sequelize = new Sequelize(config);


const config = {
    dialect: 'sqlite',
    storage: path.join(__dirname, "boda-lite.sqlite")
};

const umzug     = new Umzug({
  storage: "sequelize",

  storageOptions: {
    sequelize: sequelize
  },

  migrations: {
    params: [
      sequelize.getQueryInterface(),
      Sequelize
    ],
    path: path.join(__dirname, "./migrations")
  }
});

return umzug.up();
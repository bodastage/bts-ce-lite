'use strict';

const { Sequelize } = require('sequelize');

console.log(Sequelize );

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: queryInterface }) {
    const query = await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      other_names: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.bulkInsert('users', [{
      id: 1,
      username: 'expert',
      last_name: 'Telecomhall',
      other_names: '',
      first_name: 'Expert',
      email: 'expert@telecomhall.net',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });
    
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('users');
  }
};
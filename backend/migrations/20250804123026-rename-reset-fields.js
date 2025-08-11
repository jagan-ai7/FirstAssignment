'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'reset_token', 'resetToken');
    await queryInterface.renameColumn('Users', 'reset_expires', 'resetExpires');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'resetToken', 'reset_token');
    await queryInterface.renameColumn('Users', 'resetExpires', 'reset_expires');
  }
};

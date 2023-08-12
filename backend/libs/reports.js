const path = require('path');
const { sequelize, Sequelize } = require(path.join(__dirname, '../../', 'db', 'models', 'index.js'));
const { reports_categories, reports } = sequelize.models;

const createCategory = async (data) => {
    console.log('reports.create-category createCategory');
    return await reports_categories.create(data);
}

const updateCategory = async (data) => {
    console.log('reports.create-category updateCategory');
    return await reports_categories.update(data, {id: data.id});
}

const createReport = async (data) => {
    console.log('reports.create-report createReport');
    return await reports.create(data);
}

const updateReport = async (data) => {
    console.log('reports.create-report updateReport');
    return await reports.update(data, {id: data.id});
}

module.exports = {
    createCategory,
    updateCategory,
    createReport,
    updateReport
}
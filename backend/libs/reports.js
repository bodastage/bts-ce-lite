const path = require('path');
const log = require('electron-log');
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

async function generateCSVReport(reportId, outputFolder){
	let reportInfo = await getSQLiteReportInfo(reportId);
	let csvFileName = reportInfo.name.replace(/\s+/g,"_") + ".csv";
	//console.log(csvFileName, outputFolder, reportInfo.query);
	const reportFile = await utils.generateCSVFromQuery(csvFileName, outputFolder, reportInfo.query);
	log('download_report','success', reportFile);
}

module.exports = {
    createCategory,
    updateCategory,
    createReport,
    updateReport,
    generateCSVReport
}
const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client, Pool } = window.require('pg');
const copyFrom = require('pg-copy-streams').from;
const path = window.require('path');
const isDev = window.require('electron-is-dev');
const { app, process } = window.require('electron').remote;
const createCsvWriter = window.require('csv-writer').createObjectCsvWriter;
const SQLITE3_DB_NAME = 'boda-lite.sqlite3';
const moTransform = window.require('./mo-name-transform');
var Excel = window.require('exceljs');
const fixPath = window.require('fix-path');
const fs = window.require('fs');

//Fix PATH env variable on Mac OSX
if(process.platform === 'darwin'){ 
	fixPath(); 
	
	//Append path to postgres binaries on Mac OSX
	process.env.PATH = [
		'/Library/PostgreSQL/10/bin',
		'/Library/PostgreSQL/11/bin',
		'/Library/PostgreSQL/12/bin',
		process.env.PATH
	].join(path.delimiter);
	
}
	
let basepath = app.getAppPath();

if (!isDev) {
  basepath = process.resourcesPath
} 


const SQLITE3_DB_PATH = path.join(basepath,'db',SQLITE3_DB_NAME);


/**
* Get database connection details
*/
async function getSQLiteDBConnectionDetails(dbName='boda'){
		
		let details = await
		new Promise((resolve, reject) => {
			
			let db = new sqlite3.Database(SQLITE3_DB_PATH);
			db.all("SELECT * FROM databases WHERE name = ?", [dbName] , (err, row) => {
				if(err !== null){
					log.error(row);
					//@TODO: Show table data log error
					return reject(err);
					
				}
				
				return resolve({
					hostname : row[0].hostname,
					port : row[0].port,
					username : row[0].username,
					password : row[0].password
				});
			});
			
		});

		return details;
}


async function getSQLiteReportInfo(reportId){
		let reportInfo = await
		new Promise((resolve, reject) => {
			
			let db = new sqlite3.Database(SQLITE3_DB_PATH);
			db.all("SELECT * FROM reports r WHERE rowid = ?",[reportId], (rErr, rRows) => {
				if(rErr !== null){
					log.error(rRows);
					//@TODO: Show table data log error
					reject(rErr);
					
				}
				
				resolve(rRows[0]);
			});
			
		});

		return reportInfo;
}


/**
* Run report query
*
* @param string query
*/
async function runQuery(query){
	
	const dbConDetails  = await getSQLiteDBConnectionDetails('boda');

	const hostname = dbConDetails.hostname;
	const port = dbConDetails.port;
	const username = dbConDetails.username;
	const password = dbConDetails.password;
	
	const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/boda`;
	const client = new Client({
		connectionString: connectionString,
	});
		
	client.connect((err) => {
		if(err){
			return err;
		}
	});
		
	let results = await
	new Promise((resolve, reject) => {
		client.query(query)
		.then( result => {
			resolve(result);
		} )
		.catch(e => {
			//@TODO: Error notice
			reject(e);
			
		})
		.then(() => client.end());
	});	
	
	return results;
	
}


function getSortAndFilteredQuery(query, columnNames, AGGridSortModel, AGGridFilterModel, AGGridColumns){
	let newQuery = `SELECT * FROM (${query}) qt`;
	let FilterCount = 0;
	
	if (typeof  AGGridFilterModel === 'undefined') return query;
	
	columnNames.forEach(function(col, index){
		if( typeof AGGridFilterModel[col] !== 'undefined' ){
            let filterModel = AGGridFilterModel[col];
            let value = AGGridFilterModel[col].filter;
			
			FilterCount++;//used to determine where to place WHERE phrase
			if(FilterCount === 1){
				newQuery += ` WHERE `
			}else{
				newQuery += ` AND `
			}
			
            if( typeof filterModel.operator === 'undefined'){
                let filterType = filterModel.type;
                let filterValue= filterModel.filter;
				
                if( filterType === 'contains' ){
					newQuery += ` qt."${col}" LIKE '%${value}%' `
                }
				
                if( filterType === 'notEqual' ){
					newQuery += ` qt."${col}" ~ '^(?!${value}$)' `
                }
				
                if( filterType === 'equals' ){
					newQuery += ` qt."${col}" = '${value}' `                
                }
				
                if( filterType === 'startsWith' ){
					newQuery += ` qt."${col}" ~ '^${value}.*' `                
                }
				
                if( filterType === 'endsWith' ){
					newQuery += ` qt."${col}" ~ '.*${value}$' `                
                }
				
                if( filterType === 'endsWith' ){
					newQuery += ` qt."${col}" ~ '^((?!${value}).)*$' `                
                }
			}else{
                let filterOperator = filterModel.operator;
                let condition1 = filterModel.condition1;
                let condition2 = filterModel.condition2;
                let filterValue1 = "";
                let filterValue2 = "";
				
               if(condition1.type === 'contains') {
                    filterValue1 = ".*" + condition1.filter + ".*";
                }
                if( condition1.type === 'notEqual' ){
                    filterValue1 = '^(?!'+condition1.filter + "$)";                  
                }
                if( condition1.type === 'equals' ){
                    filterValue1 = '^'+condition1.filter + "$";           
                }
                if( condition1.type === 'startsWith' ){
                    filterValue1 = '^'+condition1.filter + ".*";                  
                }
                if( condition1.type === 'endsWith' ){
                    filterValue1 = '.*'+condition1.filter + "$";                 
                }
                if( condition1.type === 'notContains' ){
                    filterValue1 = '^((?!'+condition1.filter + ").)*$";                 
                }
                
                //condition2 filter
                if(condition2.type === 'contains') {
                    filterValue2 =  ".*" + condition2.filter + ".*";
                }
                if( condition2.type === 'notEqual' ){
                    filterValue2 = '^(?!'+condition2.filter + "$)";                  
                }
                if( condition2.type === 'equals' ){
                    filterValue2 = '^'+condition2.filter + "$";           
                }
                if( condition2.type === 'startsWith' ){
                    filterValue2 = '^'+condition2.filter + ".*";                  
                }
                if( condition2.type === 'endsWith' ){
                    filterValue2 = '.*'+condition2.filter + "$";                 
                }
                if( condition2.type === 'notContains' ){
                    filterValue2 = '^((?!'+condition2.filter + ").)*$";                 
                }

                
                newQuery +=  ` ( qt."${col}" ~ '${filterValue1}' ${filterOperator}  qt."${col}" ~ '${filterValue2}' ) `
			}
		}
	});
	
	//Sorting
    if(AGGridSortModel.length > 0 ){
		let sortCount = 0;
        AGGridSortModel.forEach(function(model, idx){
            let col = model.colId;
            let dir = model.sort;
            let colIdx = columnNames.indexOf(col);
			
			if( idx === 0) {
				newQuery += ` ORDER BY `
			}else{
				newQuery += ","
			}
			
			newQuery += ` qt."${col}" ${dir}`
        });
    }
	
	return newQuery;
	
}


/**
* Generate CSV file from SQL query
*
* @param string csvFileName
* @param string outputFolder
* @param string query SQL query text
*/
async function generateCSVFromQuery(csvFileName, outputFolder, query){
	const fileName = csvFileName + '.csv'
	try{
		let results = await runQuery(query);
		
		let header = []
		results.fields.forEach((v,i) => {
			header.push({id: v.name, title: v.name})
		});
		
		const csvWriter = createCsvWriter({
			path: path.join(outputFolder, fileName),
			header: header
		});
		
		await csvWriter.writeRecords(results.rows);
		
		//Return paht to report file
		return path.join(outputFolder, fileName);
	}catch(e){
		log.error(e);
		return false;
	}
	
}

/**
* Generae Excel file from SQL query
*
* @param string csvFileName
* @param string outputFolder
* @param string query SQL query text
*/
async function generateExcelFromQuery(excelFileName, outputFolder, query){
	
	try{
		const fileName = excelFileName + '.xlsx'
		var options = {
		  filename: path.join(outputFolder, fileName),
		  useStyles: true
		};
		

		const workbook = new Excel.Workbook();
		workbook.creator = 'Bodastage Solutions';
		const worksheet = workbook.addWorksheet(excelFileName);
		
		let results = await runQuery(query);
		
		let headers = []
		results.fields.forEach((v,i) => {
			headers.push({key: v.name, header: v.name})
		});
		
		worksheet.columns = headers;
		
		results.rows.forEach((row,i) => {
			worksheet.addRow(row).commit();
		});

		await workbook.xlsx.writeFile(path.join(outputFolder, fileName));
		
		return path.join(outputFolder, fileName);
	}catch(err){
		log.error(err)
		return false;
	}
	

}

async function generateExcelOrCSV(fileName, outputFolder, query, format){
	if(format === 'excel'){
		return await generateExcelFromQuery(fileName, outputFolder, query);
	}
	
	return await generateCSVFromQuery(fileName, outputFolder, query);
}


/**
*
* @param veondor string vendor 
* @param format string format 
* @param csvFolder string 
* @param truncateTables boolean Truncate tables before load. Values are true or false
* @param callbacks {beforeFileLoad, afterFileLoad, beforeLoad, afterLoad}
*
*/
async function loadCMDataViaStream(vendor, format, csvFolder,truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	
	
	const dbConDetails  = await getSQLiteDBConnectionDetails('boda');

	const hostname = dbConDetails.hostname;
	const port = dbConDetails.port;
	const username = dbConDetails.username;
	const password = dbConDetails.password;
	
	const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/boda`;
	
	const pool = new Pool({
	  connectionString: connectionString,
	})
	
	pool.on('error', (err, client) => {
		log.error(err.toString());
		client.release();
	})

	
	if(typeof beforeLoad === 'function'){
		beforeLoad();
	}
	
	if(truncateTables === true) {
		log.info("Truncate tables before loading is set to true.")
	}

	items = fs.readdirSync(csvFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	
	//This will be used to wait for the loading to complete before existing the function 
	let csvFileCount = items.length;
	
	//50 mb
	const highWaterMark = 50 * 1024 * 1024;
	
	//Time to wait for load to complete 
	const waitTime = 1; //1 second 
	
	//Maximum times to check
	const maxLoadWait = 10; // x waitTime 
	
	for (let i=0; i< items.length; i++) {
		let fileName = items[i];
		let filePath = path.join(csvFolder, items[i]);
		let moName = items[i].replace(/.csv$/i,'');
		
		//Remap MO name e.g UCELLSETUP to UCELL inorder to load to appropriate table 
		if(vendor.toLowerCase() === 'huawei' && typeof moTransform.HUAWEI_MO_MAP[moName] !== 'undefined'){
			 moName = moTransform.HUAWEI_MO_MAP[moName];
			log.info(`${fileName.replace(".csv","")} transformed to ${moName}}`);
		}
		
		//Transform ZTE to import ZTE Plan Template data in correct tables
		if(vendor.toLowerCase() === 'zte' && typeof moTransform.ZTE_MO_MAP[moName] !== 'undefined'){
			 moName = moTransform.ZTE_MO_MAP[moName];
			log.info(`${fileName.replace(".csv","")} transformed to ${moName}}`);
		}
		
		let table = `${vendor.toLowerCase()}_cm."${moName}"`;
		
		//Use to wait for each file to load
		let fileIsLoading = true;
		
		let client = null;
		let copyFromStream = null;
		try{
			//Get client from pool
			client = await pool.connect();
			if(client.processID === null){
				log.error('Failed to connect to database');
				return false;
			}
			
			//Truncate 
			if(truncateTables === true) await client.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
			
			
			copyFromStream = await client.query(copyFrom(`COPY ${table} (data) FROM STDIN`,{writableHighWaterMark : highWaterMark}));
		}catch(e){
			if( copyFromStream !== null) copyFromStream.end();
			if( client !== null) client.release();
			
			log.error(`Pool_Connect_Query: ${e.toString()}`);
			log.info(`Skipping loading of ${moName}`);
			
			//reduce the file count 
			--csvFileCount;
			fileIsLoading = false;
			
			//Process next file 
			//@TODO: 
			continue; 
		}

		copyFromStream.on('error', async (err) => {
			log.error(`copyFromStream.errorEvent: ${err.toString()}.  [${fileName}]`);
			
			//Reduce load  file count
			//--csvFileCount;
			fileIsLoading = false;
			
			//By setting writeStatus to null, we are letting next write konw that there was an 
			//error in the previous attempt so we should exit csvToJson
			writeStatus = null;
		});
	
		
		//Write stream status used to handle backpressure on the write stream
		let writeStatus = true;
		copyFromStream.on('drain', (err) => {
			log.info(`Write stream drained for ${moName}`);
			writeStatus = true;
		});
		
		copyFromStream.on('finish', (err) => {
			//reduce process file count 
			--csvFileCount;
			
			log.info(`Loading of  ${moName} is done. ${csvFileCount} files left.`);
			writeStatus = true;
		
			fileIsLoading = false;

		});

		if(typeof beforeFileLoad === 'function'){
			beforeFileLoad(table, fileName, csvFolder);
		}
		
		//log.info(`copyFromStream.writableHighWaterMark: ${copyFromStream.writableHighWaterMark}`);
		
		await new Promise((resolve, reject) => {
			try{//@TODO: Test whether this try block is necessary
				csv()
				.fromFile(filePath)
				.subscribe(async (json)=>{
					// plan newline for enter in db 
					const jsonString = JSON.stringify(json);
						
					//Get out of subscribe if there was an error
					if(writeStatus === null){
						return;
					}
					
					writeStatus = copyFromStream.write(jsonString + "\n");

					//Sleep for 1s	if status is false i.e to wait for the writable stream buffer/queue to free					
					while(writeStatus === false){
						log.info(`Write status: ${writeStatus} for ${fileName}. Wait for 1 second for write buffer to clear.`);
						await new Promise((rs, rj) => {  setTimeout(rs,1000);});
					}

				},(err) => {//onError
					log.error(`csvJoJson.onError: ${err.toString()}`);
					copyFromStream.end();
					reject();
				},
				()=>{//onComplete
					log.info(`End of csvToJson for ${fileName}.`)
					copyFromStream.end();
					resolve(undefined);
				}); 
			}catch(e){
				writeStatus = true; // -- to stop while(writeStatus === false) from continuing endlessly
				log.error(`Catch:csvToJson Error: {e.toString()}`);
				copyFromStream.end();
				fileIsLoading = false;
				reject(e)
				
			}
			
		});

		//Wait for loading to complete. The csvToJson can complete before 
		await new Promise(async (rs, rj) => {
			while(fileIsLoading === true ){
				log.info(`Waiting for ${waitTime} seconds for loading of ${fileName} to complete...`);
				await new Promise((rs, rj) => {  setTimeout(rs, waitTime * 1000); });
			}
			
			//Release client i.e. return to pool
			client.release();
			rs(undefined);
			
		});
		
		if(typeof afterFileLoad === 'function'){
			afterFileLoad(table, fileName, csvFolder);
		}
		
	}

	if(typeof afterLoad === 'function'){
		afterLoad();
	}

	await pool.end();
	
}


/**
* Returns the path to the psql command on MacOs
* 
* @returns string Path to psql
*/
function getPathToPsqlOnMacOSX(){
	if( process.platform === 'darwin'){
		//Enterprise DB installation
		if (fs.existsSync('/Library/PostgreSQL/10/bin/psql')) return "/Library/PostgreSQL/10/bin/psql";
		if (fs.existsSync('/Library/PostgreSQL/11/bin/psql')) return "/Library/PostgreSQL/11/bin/psql";
		if (fs.existsSync('/Library/PostgreSQL/12/bin/psql')) return "/Library/PostgreSQL/12/bin/psql";
		
		//PostgresApp
		///Applications/Postgres.app/Contents/Versions/latest/bin
		if (fs.existsSync('/Applications/Postgres.app/Contents/Versions/latest/bin/psql')) return "/Applications/Postgres.app/Contents/Versions/latest/bin/psql";
	
	}
	
	return "psql";
	
}

exports.SQLITE3_DB_PATH = SQLITE3_DB_PATH;
exports.getSQLiteDBConnectionDetails = getSQLiteDBConnectionDetails;
exports.getSQLiteReportInfo = getSQLiteReportInfo;
exports.runQuery = runQuery;
exports.generateCSVFromQuery = generateCSVFromQuery;
exports.loadCMDataViaStream = loadCMDataViaStream;
exports.generateExcelOrCSV = generateExcelOrCSV;
exports.getPathToPsqlOnMacOSX = getPathToPsqlOnMacOSX;
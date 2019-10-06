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
const bcf = window.require('./boda-cell-file');
const queryHelper = window.require('./query-helpers');
const baseline = window.require('./baseline');
const bgUtils = window.require('./bg-utils');
const { VENDOR_CM_FORMATS, VENDOR_PM_FORMATS, VENDOR_FM_FORMATS,
		VENDOR_CM_PARSERS, VENDOR_PM_PARSERS, VENDOR_FM_PARSERS } = window.require('./vendor-formats');
const tems = window.require('./tems');

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
* @param string options CSV options like separator
*/
async function generateCSVFromQuery(csvFileName, outputFolder, query, options){
	const fileName = csvFileName + '.csv'
	try{
		let results = await queryHelper.runQuery(query);
		
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

//reference: https://stackoverflow.com/questions/181596/how-to-convert-a-column-number-eg-127-into-an-excel-column-eg-aa
function getCharFromNumber(columnNumber){
    var dividend = columnNumber;
    var columnName = "";
    var modulo;

    while (dividend > 0)
    {
        modulo = (dividend - 1) % 26;
        columnName = String.fromCharCode(65 + modulo).toString() + columnName;
        dividend = parseInt((dividend - modulo) / 26);
    } 
    return  columnName;
}

/**
* Generae Excel file from SQL query
*
* @param string csvFileName
* @param string outputFolder
* @param string query SQL query text
* @param options options Options like styles to apply to results for excel
*/
async function generateExcelFromQuery(excelFileName, outputFolder, query, options){
	
	try{
		const fileName = excelFileName + '.xlsx'
		var excelOptions = {
		  filename: path.join(outputFolder, fileName),
		  useStyles: true
		};
		

		const workbook = new Excel.Workbook();
		
		workbook.creator = 'Bodastage Solutions';
		const worksheet = workbook.addWorksheet(excelFileName);
		
		let results = await queryHelper.runQuery(query);
		
		let headers = []
		let tableFields = []
		results.fields.forEach((v,i) => {
			headers.push({key: v.name, header: v.name})
			tableFields.push(v.name)
		});
		
		worksheet.columns = headers;
		
		//Report table styles 
		let tableStyles = {};
		if(typeof options.reportId !== 'undefined'){
			const reportId = options.reportId;

			const res = await queryHelper.runQuery(`SELECT options FROM reports.reports WHERE id  = ${reportId}`);

			const rptOptions = res.rows[0].options;

			if(typeof rptOptions.tableStyles !== 'undefined'){
				tableStyles = rptOptions.tableStyles;
			}
		}
		
		results.rows.forEach((row,i) => {
			const rowNumber = i + 2;
			worksheet.addRow(row).commit();
			
			worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, function (cell, colNumber) {
				//columns 
				const colField = tableFields[colNumber-1]
				if(typeof tableStyles[colField] !== 'undefined'){
					const cellValue = row[colField];
					const conditions = tableStyles[colField].conditions
					
					styles = {}
					for(var cIdx in conditions){
						const cond = conditions[cIdx]
						
						const styleConditions = cond.styleConditions;
						const property = cond.property;
						const propertyValue = cond.propertyValue;
						
						//Array with resultfrom evaluating each style condition
						let stArray = styleConditions.map( cdn => { 
							const op = cdn.op;
							const rValType = cdn.rValType;
							const rValue = cdn.rValue;
							const rVal = rValType === 'COLUMN'? row[rValue] : rValue;
							return bgUtils.checkStyleCondition(cellValue, op, rVal);
						});

						const styleResult = eval(stArray.join(" && "));
						if(styleResult){
							const styles = bgUtils.getExcelJsCellStyle(property, propertyValue)

							if(Object.keys(styles.fill).length > 0 ){
								cell.fill = styles.fill;
							}
							
							if(Object.keys(styles.font).length > 0 ){
								cell.font = styles.font;
							}
							
						}
					}
				}
			})
		});
		
		await workbook.xlsx.writeFile(path.join(outputFolder, fileName));
		
		
		return path.join(outputFolder, fileName);
	}catch(err){
		log.error(err)
		return false;
	}
	

}

async function generateExcelOrCSV(fileName, outputFolder, query, format, options){
	if(format === 'excel'){
		return await generateExcelFromQuery(fileName, outputFolder, query, options);
	}
	
	return await generateCSVFromQuery(fileName, outputFolder, query, options);
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
	
	
	const dbConDetails  = await queryHelper.getSQLiteDBConnectionDetails('boda');

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
	let filesNotLoaded = 0; //Keep count of files not loaded
	
	//100 mb
	const highWaterMark = 100 * 1024 * 1024;
	
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
		
		if(vendor.toLowerCase() === 'ericsson' && typeof moTransform.HUAWEI_MO_MAP[moName] !== 'undefined'){
			 moName = moTransform.ERICSSON_MO_MAP[moName];
			log.info(`${fileName.replace(".csv","")} transformed to ${moName}}`);
		}
		
		//Transform ZTE to import ZTE Plan Template data in correct tables
		if(vendor.toLowerCase() === 'zte' && typeof moTransform.ZTE_MO_MAP[moName] !== 'undefined'){
			 moName = moTransform.ZTE_MO_MAP[moName];
			log.info(`${fileName.replace(".csv","")} transformed to ${moName}}`);
		}
		
		//Transform Ericsson BSM inventory dump files 
		if(vendor.toLowerCase("ericsson") && format === 'BSM'){
			moName = 'invBSM';
		}
		
		//Load Motorola Cell X Export
		if(vendor.toLowerCase("motorola") && format === 'CELL_X_EXPORT'){
			moName = 'cell_x_export';
		}
		
		//Transform AUTOBAK_XML mo names to uppercase
		if(vendor.toLowerCase("huawei") && format === 'AUTOBAK_XML'){
			moName = moName.toUpperCase();
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
			
			//reduce the file count the needs to be processed 
			--csvFileCount;
			fileIsLoading = false;
			
			//Increament the count of files that have not been processed
			++filesNotLoaded;
			
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
		
		copyFromStream.on('end', (err) => {
			//reduce process file count 
			--csvFileCount;
			
			log.info(`Loading of  ${moName} is done. ${csvFileCount} csv files remaining to be processed.`);
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
					// Remove """ from json 
					const jsonString = JSON.stringify(json);
					
					//Escape backslash in jsonString
					//Example scenario is "\"SubNetwork=ONRM_ROOT_MO_R\"" becomes ""SubNetwork=ONRM_ROOT_MO_R"" which causes an error on insertion.
					//The replacement below escapes the backslash to preserve it ib the jsonString for insertion
					var re = new RegExp(String.fromCharCode(92, 92), 'g');
					const sanitizedJsonString= jsonString.replace(re,String.fromCharCode(92,92));

					//Get out of subscribe if there was an error
					if(writeStatus === null){
						return;
					}
					
					writeStatus = copyFromStream.write(sanitizedJsonString + "\n");

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

		//Wait for loading to complete. The csvToJson can complete before the streamWriter is done
		await new Promise(async (rs, rj) => {
			while(fileIsLoading === true ){
				log.info(`Waiting for ${waitTime} seconds for loading of ${fileName} to complete...`);
				await new Promise((rs, rj) => {  setTimeout(rs, waitTime * 1000); });
			}
			
			//Release client i.e. return to pool
			await client.release();
			rs(undefined);
			
		});
		
		if(typeof afterFileLoad === 'function'){
			afterFileLoad(table, fileName, csvFolder);
		}
		
	}

	log.info(`${filesNotLoaded} files not loaded.`)
	
	if(typeof afterLoad === 'function'){
		afterLoad();
	}


	await pool.end();
	
	return {status: "success", message: "Loading completed."}
	
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

/*
* Run database migrations
* 
* @param string hostname 
* @param string port 
* @param string username 
* @param string password 
*
* @since 0.3.0
*/
async function runMigrations(hostname, port, username, password){
	
	const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/postgres`;
	const client = new Client({
		connectionString: connectionString,
	});
		
	client.connect((err) => {
		if(err){
			return err;
		}
	});
	
	//@TODO: Check if user wants to recreate database or just update
	try{
		let results = await
		new Promise( async (resolve, reject) => {
			let res = await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'boda'");
			res  = await client.query("DROP DATABASE IF EXISTS boda");
			res  = await client.query("DROP ROLE IF EXISTS bodastage");
			res  = await client.query("CREATE USER bodastage WITH PASSWORD 'password'");
			res  = await client.query("CREATE DATABASE boda owner bodastage");

			client.end();
			if(typeof res.err !== 'undefined') reject("Error occured"); else resolve("Database and role created successfully.");
			
		});	
	}catch(e){
		return {status: 'error', message: 'Error occurred while running migrations. See log for details'}	
	}
	
	//add tablefunc extension 
	const connStr2 = `postgresql://${username}:${password}@${hostname}:${port}/boda`;
	const client2 = new Client({connectionString: connStr2});
	client2.connect((err) => {
		if(err){
			log.error(err)
			return {status: 'error', message: 'Error occurred while creating tablefunc extension. See log for details'}	
		}
	});
	
	try{
		let results = await
		new Promise( async (resolve, reject) => {
			const res  = await client2.query("CREATE EXTENSION IF NOT EXISTS  tablefunc");
			client2.end();
			if(typeof res.err !== 'undefined') reject("Error occured while creating tablefunc extension"); else resolve("tablefunc extension created successfully.");
		});	
	}catch(e){
		return {status: 'error', message: 'Error occurred while creating tablefunc extension. See log for details'}	
	}
	
	
	//Get app base path
	let basePath = app.getAppPath();
	if (!isDev) basePath = process.resourcesPath;	
	
	//Create boda database 
	const dbCon  = await queryHelper.getSQLiteDBConnectionDetails('boda');
	const bodaConnStr = `postgresql://${dbCon.username}:${dbCon.password}@${dbCon.hostname}:${dbCon.port}/boda`;
	const migrationDir = path.join(basePath,'db','migrations');
	const options = {
			databaseUrl: bodaConnStr ,
			dir:  migrationDir,
			direction: 'up',
			count: Infinity,
			migrationsTable: 'pgmigrations',
			log: log.log			
		};
	
	log.info(`Migration directory: ${migrationDir}`)
	
	
	const migrationRunner = window.require('node-pg-migrate');
	
	try {
		await migrationRunner(options);
	} catch(e) {
		log.error(e.toString());
		return {status: 'error', message: 'Error occurred while running migrations. See log for details'}	
	}
	
	return {status: 'success', message: 'Database setup/upgrade completed successfully'}
	
	
}

/*
* Parse measurement collection XML files 
*
* @param string inputFolder
* @param string outputFolder
*/
function parseMeasuremenetCollectionXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse){
	let basepath = app.getAppPath();

	if (!isDev) {
	  basepath = process.resourcesPath
	} 
	
	const parser = VENDOR_PM_PARSERS[vendor][format]
	const parserPath = path.join(basepath,'libraries',parser)
	
	let commandArgs  = ['-jar', parserPath, '-i',inputFolder,'-o',outputFolder];
	
	const child = spawnSync('java', commandArgs);
	log.info(`java ${commandArgs.join(" ")}`);
	
	if(child.status != 0){
		log.error(`[parseMeasuremenetCollectionXML] error:${child.output.toString()}`);
		return {status: 'error', message: `Error parsing  ${vendor} PM ${format}`}
	}else{
		//log.info(child.output.toString())
		
	}
	
	return {status: 'success', message: `${vendor} PM files successfully parsed.`} 
	
}

/*
* Parse Huawei NE Based measurement collection XML files 
*
*/
function parseHuaweiNeBasedMeasCollecXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse){
	let basepath = app.getAppPath();

	if (!isDev) {
	  basepath = process.resourcesPath
	} 
	
	const parser = VENDOR_PM_PARSERS[vendor][format]
	const parserPath = path.join(basepath,'libraries',parser)
	
	let commandArgs  = ['-jar', parserPath, '-i',inputFolder,'-o',outputFolder];
	
	const child = spawnSync('java', commandArgs);
	log.info(`java ${commandArgs.join(" ")}`);
	
	if(child.status != 0){
		log.error(`[parseHuaweiNeBasedMeasCollecXML] error:${child.output.toString()}`);
		return {status: 'error', message: `Error parsing  ${vendor} PM ${format}`}
	}else{
		//log.info(child.output.toString())
		
	}
	
	return {status: 'success', message: `${vendor} PM files successfully parsed.`} 
	
}

function parseNokiaPMXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse){
	let basepath = app.getAppPath();

	if (!isDev) {
	  basepath = process.resourcesPath
	} 
	
	const parser = VENDOR_PM_PARSERS[vendor][format]
	const parserPath = path.join(basepath,'libraries',parser)
	
	let commandArgs  = ['-jar', parserPath, '-i',inputFolder,'-o',outputFolder];
	
	const child = spawnSync('java', commandArgs);
	log.info(`java ${commandArgs.join(" ")}`);
	
	if(child.status != 0){
		log.error(`[parseNokiaPMXML] error:${child.output.toString()}`);
		return {status: 'error', message: `Error parsing  ${vendor} PM ${format}`}
	}else{
		//log.info(child.output.toString())
		
	}
	
	return {status: 'success', message: `${vendor} PM files successfully parsed.`} 
}

function parsePMFiles(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse){

	if( vendor === 'ERICSSON' && format === 'MEAS_COLLEC_XML'){
		return parseMeasuremenetCollectionXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse)
	}
	
	if( vendor === 'HUAWEI' && format === 'NE_BASED_MEAS_COLLEC_XML'){
		return parseHuaweiNeBasedMeasCollecXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse)
	}
	
	if( vendor === 'NOKIA' && format === 'PM_XML'){
		return parseNokiaPMXML(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse)
	}
	
	return {status: 'error', message: 'PM processing not yet implemented.'}
}

/*
* Parse network dumps and traces
*
* @param string dataType Type of data being loaded 
* @param string vendor Vendor
* @param string format format 
* @param string inputFolder   
* @param boolean outputFolder
* @param function beforeFileParse
* @param function afterFileParse
* @param function beforeParse
* @param function afterParse
*
* @since 0.3.0
*/
async function parseData(dataType, vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse){
	
	if(dataType === 'PM'){
		return parsePMFiles(vendor, format, inputFolder, outputFolder, beforeFileParse, afterFileParse, beforeParse, afterParse);
	}
	
	if(dataType === 'FM'){
		return {status: 'success', message: 'FM processing not yet implemented.'}
	}
	
	if(dataType === 'CM'){
		if( vendor === 'BODASTAGE') return {status: 'success', message: 'No parsing necessary for the Boda cell file.'}
		return {status: 'success', message: 'CM processing not yet implemented.'}
	}
	
	
	return {status: 'error', message: 'Unknown data type'}
}

/*
* Load Boda Cell File
*
* @param string input folder
* @param boolean truncateTables
* @deprecated
*
* @since 0.3.0
*/
async function loadBodaCellFile(inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	//1.Load cells 
	// -get columns from first row
	// -validate that the key parameter columns exist 
	// -
	//2.add nbrs

			
	const dbConDetails  = await queryHelper.getSQLiteDBConnectionDetails('boda');

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
		
		client = await pool.connect();
		if(client.processID === null){
			log.error('Failed to connect to database');
			return {status: "error", message: 'Failed to connect to database during boda cell file loading'};
		}
		
		await client.query(`TRUNCATE plan_network."2g_cells" RESTART IDENTITY CASCADE`);
		await client.query(`TRUNCATE plan_network."3g_cells" RESTART IDENTITY CASCADE`);
		await client.query(`TRUNCATE plan_network."4g_cells" RESTART IDENTITY CASCADE`);
		
		client.release();
	}
	
	
	fileList = fs.readdirSync(inputFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	
	for (let i=0; i< fileList.length; i++) {
		let fileName = fileList[i];
		let filePath = path.join(inputFolder, fileList[i]);
		
		client = await pool.connect();
		if(client.processID === null){
			log.error('Failed to connect to database');
			return {status: "error", message: 'Failed to connect to database during boda cell file loading'};
		}
		
		
		let parameterList = [];
		//This is used to capture load error in onError Event
		let loadError = null;
		
		await new Promise((resolve, reject) => {
			csv({output: "csv", noheader:true, trim:true})
			.fromFile(filePath)
			.subscribe(async (csvRow, index)=>{
				
				//Header column 
				if(index === 0){
					parameterList = csvRow;
					return;
				}
				
				//Insert cell parameters 
				const sql = bcf.generateParameterInsertQuery(parameterList, csvRow);
				log.log(sql);
				await client.query(sql);
				
				//Insert relations
				const nbrSQL = bcf.generateNbrInsertQuery(parameterList, csvRow);
				log.log(nbrSQL);
				if (nbrSQL !== null) await client.query(nbrSQL);
				
			},(err) => {//onError
				log.error(`csvJoJson.onError: ${err.toString()}`);
				client.release();
				loadError = `Error while loading ${fileName}`;
				resolve();
			},
			()=>{//onComplete
				log.info(`End of csvToJson for ${fileName}.`)
				client.release();
				resolve();
			});
		});//eof: promise
		
		//Return error status if loadError is not null
		if(loadError !== null) return {status: 'error', message: loadError}; 
		
	}

	if(typeof afterLoad === 'function'){
		afterLoad();
	}
	
	return {status: 'success', message: 'Boda Cell File successfully loaded.'}
}


async function loadEricssonMeasCollectXML(inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){

	const dbConDetails  = await queryHelper.getSQLiteDBConnectionDetails('boda');

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
		
		client = await pool.connect();
		if(client.processID === null){
			log.error('Failed to connect to database');
			return {status: "error", message: 'Failed to connect to database during boda cell file loading'};
		}
		
		await client.query(`TRUNCATE pm."ericsson" RESTART IDENTITY CASCADE`);
		
		client.release();
	}
	
	
	fileList = fs.readdirSync(inputFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	

	//This will be used to wait for the loading to complete before existing the function 
	let csvFileCount = fileList.length;
	let filesNotLoaded = 0; //Keep count of files not loaded
	
	//100 mb
	const highWaterMark = 100 * 1024 * 1024;
	
	//Time to wait for load to complete 
	const waitTime = 1; //1 second 
	
	//Maximum times to check
	const maxLoadWait = 10; // x waitTime 
	
	for (let i=0; i< fileList.length; i++) {
		let fileName = fileList[i];
		let filePath = path.join(inputFolder, fileList[i]);
		
		//Use to wait for each file to load
		let fileIsLoading = true;
		let client = null;
		let copyFromStream = null;
		let tableFields = ["file_name",
							"file_format_version",
							"vendor_name",
							"file_header_dnprefix",
							"file_sender_localdn",
							"element_type",
							"collection_begin_time",
							"collection_end_time",
							"managed_element_localdn",
							"ne_software_version",
							"meas_infoid",
							"meas_timestamp",
							"jobid",
							"gran_period_duration",
							"gran_period_endtime",
							"reporting_period",
							"managed_element_userlabel",
							"meas_objldn",
							"meas_type",
							"meas_result",
							"suspect"];
							
		let table = 'pm."eri_meas_collec_xml"'
		
		try{
			//Get client from pool
			client = await pool.connect();
			if(client.processID === null){
				log.error('Failed to connect to database');
				return false;
			}
			
			//copyFromStream = await client.query(copyFrom(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv)`,{writableHighWaterMark : highWaterMark}));
			//log.info(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv)`)
			copyFromStream = await client.query(copyFrom(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv, HEADER)`,{writableHighWaterMark : highWaterMark}));
			log.info(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv, HEADER)`)
		}catch(e){
			if( copyFromStream !== null) copyFromStream.end();
			if( client !== null) client.release();
			
			log.error(`Pool_Connect_Query: ${e.toString()}`);
			log.info(`Skipping loading of ${fileName}`);
			
			//reduce the file count the needs to be processed 
			--csvFileCount;
			fileIsLoading = false;
			
			//Increament the count of files that have not been processed
			++filesNotLoaded;
			
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
			log.info(`Write stream drained for ${fileName}`);
			writeStatus = true;
		});
		
		copyFromStream.on('end', (err) => {
			//reduce process file count 
			--csvFileCount;
			
			log.info(`Loading of  ${fileName} is done. ${csvFileCount} csv files remaining to be processed.`);
			writeStatus = true;
		
			fileIsLoading = false;

		});

		if(typeof beforeFileLoad === 'function'){
			beforeFileLoad(table, fileName, inputFolder);
		}
		
		var fileStream = fs.createReadStream(filePath);
		
		fileStream.on('error', (err) => {
			log.error(err)
		});
		
		fileStream.pipe(copyFromStream);
		
		///
		///
		///
		///
		
		

		//Wait for loading to complete. The csvToJson can complete before 
		await new Promise(async (rs, rj) => {
			while(fileIsLoading === true ){
				log.info(`Waiting for ${waitTime} seconds for loading of ${fileName} to complete...`);
				await new Promise((rs, rj) => {  setTimeout(rs, waitTime * 1000); });
			}
			
			//Release client i.e. return to pool
			await client.release();
			rs(undefined);
			
		});
		
		if(typeof afterFileLoad === 'function'){
			afterFileLoad(table, fileName, inputFolder);
		}
	}

	log.info(`${filesNotLoaded} files not loaded.`)
	
	if(typeof afterLoad === 'function'){
		afterLoad();
	}


	await pool.end();
	
	return {status: "success", message: "Loading completed."}
	
}


async function loadCSVFiles(table, tableFields, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){

	const dbConDetails  = await queryHelper.getSQLiteDBConnectionDetails('boda');

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
		
		client = await pool.connect();
		if(client.processID === null){
			log.error('Failed to connect to database');
			return {status: "error", message: 'Failed to connect to database during boda cell file loading'};
		}
		
		await client.query(`TRUNCATE pm."ericsson" RESTART IDENTITY CASCADE`);
		
		client.release();
	}
	
	
	fileList = fs.readdirSync(inputFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	

	//This will be used to wait for the loading to complete before existing the function 
	let csvFileCount = fileList.length;
	let filesNotLoaded = 0; //Keep count of files not loaded
	
	//100 mb
	const highWaterMark = 100 * 1024 * 1024;
	
	//Time to wait for load to complete 
	const waitTime = 1; //1 second 
	
	//Maximum times to check
	const maxLoadWait = 10; // x waitTime 
	
	for (let i=0; i< fileList.length; i++) {
		let fileName = fileList[i];
		let filePath = path.join(inputFolder, fileList[i]);
		
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
			
			//copyFromStream = await client.query(copyFrom(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv)`,{writableHighWaterMark : highWaterMark}));
			//log.info(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv)`)
			copyFromStream = await client.query(copyFrom(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv, HEADER)`,{writableHighWaterMark : highWaterMark}));
			log.info(`COPY ${table} (${tableFields.join(',')}) FROM STDIN WITH (FORMAT csv, HEADER)`)
		}catch(e){
			if( copyFromStream !== null) copyFromStream.end();
			if( client !== null) client.release();
			
			log.error(`Pool_Connect_Query: ${e.toString()}`);
			log.info(`Skipping loading of ${fileName}`);
			
			//reduce the file count the needs to be processed 
			--csvFileCount;
			fileIsLoading = false;
			
			//Increament the count of files that have not been processed
			++filesNotLoaded;
			
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
			log.info(`Write stream drained for ${fileName}`);
			writeStatus = true;
		});
		
		copyFromStream.on('end', (err) => {
			//reduce process file count 
			--csvFileCount;
			
			log.info(`Loading of  ${fileName} is done. ${csvFileCount} csv files remaining to be processed.`);
			writeStatus = true;
		
			fileIsLoading = false;

		});

		if(typeof beforeFileLoad === 'function'){
			beforeFileLoad(table, fileName, inputFolder);
		}
		
		var fileStream = fs.createReadStream(filePath);
		
		fileStream.on('error', (err) => {
			log.error(err)
		});
		
		fileStream.pipe(copyFromStream);
		
		//Wait for loading to complete. The csvToJson can complete before 
		await new Promise(async (rs, rj) => {
			while(fileIsLoading === true ){
				log.info(`Waiting for ${waitTime} seconds for loading of ${fileName} to complete...`);
				await new Promise((rs, rj) => {  setTimeout(rs, waitTime * 1000); });
			}
			
			//Release client i.e. return to pool
			await client.release();
			rs(undefined);
			
		});
		
		if(typeof afterFileLoad === 'function'){
			afterFileLoad(table, fileName, inputFolder);
		}
	}

	log.info(`${filesNotLoaded} files not loaded.`)
	
	if(typeof afterLoad === 'function'){
		afterLoad();
	}


	await pool.end();
	
	return {status: "success", message: "Loading completed."}
	
}

async function loadPMData(vendor, format, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	
	if(vendor === 'ERICSSON' && format === 'MEAS_COLLEC_XML'){
		return await  loadEricssonMeasCollectXML(inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad);
	}
	
	if(vendor === 'HUAWEI' && format === 'NE_BASED_MEAS_COLLEC_XML'){
		let table = 'pm.hua_ne_based_meas_collec_xml';
		let tableFields = ['file_name','collection_begin_time','collection_end_time','file_format_version','vendor_name','element_type','managed_element','meas_infoid','gran_period_duration','gran_period_endtime','rep_period_duration','meas_objldn','counter_id','counter_value', 'suspect']
		return loadCSVFiles(table, tableFields, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad)	
	}
	
	if(vendor === 'NOKIA' && format === 'PM_XML'){
		let table = 'pm.nok_pm_xml';
		let tableFields = ['filename','start_time','interval','base_id','local_moid','ne_type','measurement_type','counter_id','counter_value']
		return loadCSVFiles(table, tableFields, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad)	
	}
	
	return {status: 'success', message: 'PM functionality is not ready!'}
}

/*
* Load network dumps/traces
*
* @param string dataType Type of data being loaded 
* @param string vendor Vendor
* @param string format format 
* @param string inputFolder   
* @param boolean truncateTables Truncate tables before load. Values are true or false
* @param function beforeFileLoad
* @param function afterFileLoad
* @param function beforeLoad
* @param function afterLoad
*
* @since 0.3.0
*/
async function loadData(dataType, vendor, format, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	if(dataType === 'CM' && vendor !== 'BODASTAGE'){
		return await loadCMDataViaStream(vendor, format, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad);
	}

	//Loda boda cell file
	if(dataType === 'CM' && vendor === 'BODASTAGE'){
		return await loadBodaCellFile(inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad);
	}
	
	if(dataType === 'PM' ){
		return await loadPMData(vendor, format, inputFolder, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad);
	}
	
	if(dataType === 'FM' ){
		return {status: 'success', message: 'FM functionality is not ready!'}
	}
	
	return {status: 'error', message: 'Unknown data type'}
}


/*
* Run network baseline 
*
* @param string clustering Clustering algorithm used 
* @param string scoring Scoring algorithm used to choose baseline
* @param function infoStatusCallBack callback function sending back updates
*/
async function runBaseline(clustering, scoring, infoStatusCallBack){
	
	//Auto-generate parameter reference if it is missing 
	//Check if the parameter refence is empty
	const result = await queryHelper.runQuery("SELECT (count(1))::INTEGER AS ref_count FROM telecomlib.parameter_reference t");
	const refCount = result.rows[0].ref_count;
	infoStatusCallBack("Checking if there is a parameter reference...");
	if(refCount === 0){
		infoStatusCallBack("Parameter reference is empty. Auto-generating a parameter reference from the network dumps...");
		await baseline.autoGenerateParameterRef(false);
		infoStatusCallBack("Parameter reference was successfully generated.");
	}else{
		infoStatusCallBack("Parameter reference is available.");
	}
	
	//Check if there a baseline configuration. If there is none, use reference 
	infoStatusCallBack("Checking if there is a baseline configuration...");
	const result2 = await queryHelper.runQuery("SELECT (count(1))::INTEGER AS cnt FROM baseline.configuration t");
	const baselineConfCount = result2.rows[0].cnt;
	if(baselineConfCount === 0){
		infoStatusCallBack("No baseline configuration provided. Auto-creating configuration from the parameter reference...");
		
		await baseline.autoGenerateParameterRef(false);
		await queryHelper.runQuery(`
			INSERT INTO baseline.configuration 
			(vendor, technology, mo, parameter, baseline) 
			SELECT 
				t1.vendor AS vendor, 
				t1.technology AS technology,  
				t1.mo AS mo,  
				t1.parameter_id AS parameter,  
				'' AS baseline 
			FROM 
				telecomlib.parameter_reference t1
		`);
		infoStatusCallBack("Baseline configuration successfully generated.");
	}else{
		infoStatusCallBack("Baseline configuration is available.");
	}
	
	infoStatusCallBack("Running baseline audit...");
	await baseline.computeBaseline(clustering, scoring);
	
	return {status: 'success', message: 'Baseline audit successfully run.'}
}


/*
* Upload/Update user baseline 
* 
* The baseline file is uploaded to baseline.configuration 
*
* @param string baselineFile The baseline file to upload
* @param boolean replace Replace previous reference
*/
async function uploadUserBaseline(baselineFile, replace){
	try{ 
		await baseline.uploadUserBaseline(baselineFile, replace);
	}catch(e){
		log.error(e)
		return {status: 'error', message: 'Error while uploading baseline file. Check logs.'};
	}
	return {status: 'success', message: 'Baseline file successfully imported.'}
}


/*
* Import parameter reference
*
* @param string parameterReferenceFile The baseline file to upload
* @param boolean replace Replace previous reference
*/
async function uploadParameterReference(parameterReferenceFile, replace){
	try{ 
		await baseline.uploadParameterReference(parameterReferenceFile, replace);
	}catch(e){
		log.error(e)
		return {status: 'error', message: 'Error while uploading file. Check logs.'};
	}
	return {status: 'success', message: 'Parameter reference successfully imported.'}
}


/**
* Clear table fore loading
*
*/
async function autoGenerateParameterRef(clearTableBefore){
	try{ 
		await baseline.autoGenerateParameterRef(clearTableBefore);
	}catch(e){
		log.error(e)
		return {status: 'error', message: 'Error while generating parameter reference. Check logs.'};
	}
	return {status: 'success', message: 'Parameter reference successfully generated.'}
}

async function downloadBaselineReference(fileName, outputFolder, format){
	try{ 
		const f = typeof format === 'undefined' ? 'csv' : format;
		const q = "SELECT vendor, technology, mo, parameter, baseline as baseline_value FROM baseline.vw_configuration"
		const dlFileName = await generateExcelOrCSV(fileName, outputFolder, q, f, {});
		return {status: 'success', message: dlFileName };
	}catch(e){
		log.error(e)
		return {status: 'error', message: 'Error while generating baseline reference. Check logs.'};
	}
}

async function addParamToBaselineRef(vendor, tech, mo, parameter, baselineValue){
	try{
			await baseline.updateBaselineParameter(vendor, tech, mo, parameter, baselineValue);
			return {status: 'success', message:  `Parameter ${parameter} added to baselined` };
	}catch(e){
		log.error(e)
		return {status: 'error', message: 'Error while updating baseline reference. Check logs for details.'};		
	}
}

/*
* Delete parameter from baseline configuration
*
*/
async function deleteBaselineParameter(vendor, tech, mo, parameter){
	try{	
		const sql = `DELETE FROM baseline.configuration WHERE vendor = '${vendor}' AND technology = '${tech}' AND mo = '${mo}' AND parameter = '${parameter}'`;
		await queryHelper.runQuery(sql);
		return {status: 'success', message:  `Parameter ${parameter} added to baselined` };
	}catch(e){
		log.error(e);
		return {status: 'error', message: `Error while deleting ${parameter}. Check logs for details.`};		
	}
}

async function importGISFile(fileName, format, truncateTable){
	try{
		if( format === 'BCF'){
			await bcf.loadBodaCellFile(fileName, truncateTable);
			return {status: 'success', message:  `Successfully imported ${fileName}` };
		}
		
		if(format === 'TEMS'){
			await tems.loadTEMSFile(fileName, truncateTable);
			return {status: 'success', message:  `Successfully imported ${fileName}` };
		}
		return {status: 'error', message:  ` Import failed. Unsupported file format ${format}.` };

	}catch(e){
		log.error(e);
		return {status: 'error', message: `Error occured while importing ${format} file. Check logs for details.`};		
	}
}

async function clearBaselineReference(){
	try{
		await queryHelper.runQuery("TRUNCATE TABLE baseline.configuration RESTART IDENTITY");
		return {status: 'success', message:  `Successfully cleared baseline reference` };
	}catch(e){
		log.error(e);
		return {status: 'error', message: `Error occured while importing ${format} file. Check logs for details.`};		
	}
}

exports.clearBaselineReference = clearBaselineReference;
exports.importGISFile = importGISFile;
exports.addParamToBaselineRef = addParamToBaselineRef;
exports.runBaseline = runBaseline;
exports.SQLITE3_DB_PATH = SQLITE3_DB_PATH;
exports.getSQLiteReportInfo = getSQLiteReportInfo;
exports.generateCSVFromQuery = generateCSVFromQuery;
exports.loadCMDataViaStream = loadCMDataViaStream;
exports.generateExcelOrCSV = generateExcelOrCSV;
exports.getPathToPsqlOnMacOSX = getPathToPsqlOnMacOSX;
exports.runMigrations = runMigrations;
exports.loadData = loadData;
exports.parseData = parseData;
exports.uploadUserBaseline = uploadUserBaseline;
exports.uploadParameterReference = uploadParameterReference;
exports.autoGenerateParameterRef = autoGenerateParameterRef;
exports.downloadBaselineReference = downloadBaselineReference;
exports.deleteBaselineParameter = deleteBaselineParameter;
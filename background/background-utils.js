const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client } = window.require('pg');
const copyFrom = require('pg-copy-streams').from;
const path = window.require('path');
const isDev = window.require('electron-is-dev');
const { app, process } = window.require('electron').remote;
const createCsvWriter = window.require('csv-writer').createObjectCsvWriter;
const SQLITE3_DB_NAME = 'boda-lite.sqlite3';

	
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
	
	try{
		let results = await runQuery(query);
		
		let header = []
		results.fields.forEach((v,i) => {
			header.push({id: v.name, title: v.name})
		});
		
		const csvWriter = createCsvWriter({
			path: path.join(outputFolder, csvFileName),
			header: header
		});
		
		await csvWriter.writeRecords(results.rows);
		
		//Return paht to report file
		return path.join(outputFolder, csvFileName);
	}catch(e){
		return false;
	}
	
}

/**
*
* @param veondor string vendor 
* @param format string format 
* @param csvFolder string 
* @param callbacks {beforeFileLoad, afterFileLoad, beforeLoad, afterLoad}
*
*/
async function loadCMDataViaStream(vendor, format, csvFolder, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	
	
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
			log.error(err);
			return err;
		}
	});
	
	if(typeof beforeLoad === 'function'){
		beforeLoad();
	}

	items = fs.readdirSync(csvFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	
	for (let i=0; i<items.length; i++) {
		let fileName = items[i];
		let filePath = path.join(csvFolder, items[i]);
		let moName = items[i].replace(/.csv$/i,'');
		let table = `${vendor.toLowerCase()}_cm."${moName}"`;

		let copyFromStream = null;
		try{
			copyFromStream = client.query(copyFrom(`COPY ${table} (data) FROM STDIN`));
		}catch(e){
			if( copyFromStream !== null) copyFromStream.end();
			
			log.error(e);
			return false;
		}

		
		if(typeof beforeFileLoad === 'function'){
			beforeFileLoad(table, fileName, csvFolder);
		}

		await new Promise((resolve, reject) => {
			csv()
			.fromFile(filePath)
			.subscribe((json)=>{
				const jsonString = JSON.stringify(json);
				//log.info(jsonString);
				try{
					copyFromStream.write(jsonString + "\n");
				}catch(err){
					log.error(err);
				}

			},(err) => {//onError
				log.error(err);
				copyFromStream.end();
				reject();
			},
			()=>{//onComplete
				copyFromStream.end();
				resolve(undefined);
			}); 
			
		});

		
		if(typeof afterFileLoad === 'function'){
			afterFileLoad(table, fileName, csvFolder);
		}
	}
	
	
	if(typeof afterLoad === 'function'){
		afterLoad();
	}
	
}



exports.SQLITE3_DB_PATH = SQLITE3_DB_PATH;
exports.getSQLiteDBConnectionDetails = getSQLiteDBConnectionDetails;
exports.getSQLiteReportInfo = getSQLiteReportInfo;
exports.runQuery = runQuery;
exports.generateCSVFromQuery = generateCSVFromQuery;
exports.loadCMDataViaStream = loadCMDataViaStream;

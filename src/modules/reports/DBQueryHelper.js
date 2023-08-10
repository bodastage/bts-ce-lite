//import { SQLITE3_DB_PATH } from "../session/db-settings";

//const sqlite3 = window.require('sqlite3').verbose()
// const log = window.require('electron-log');
//const { Client } = window.require('pg');


/**
* Get database connection details
*/
export async function getSQLiteDBConnectionDetails(dbName){
		
		let details = await
		await new Promise((resolve, reject) => {
			
			row = btslite_api.dbQuery("SELECT * FROM databases WHERE name = ?", [dbName]);
			console.log(row);

			resolve(row);

			// let db = new sqlite3.Database(SQLITE3_DB_PATH);
			// db.all("SELECT * FROM databases WHERE name = ?", [dbName] , (err, row) => {
			// 	if(err !== null){
			// 		log.error(row);
			// 		//@TODO: Show table data log error
			// 		return reject(err);
					
			// 	}
				
			// 	return resolve({
			// 		hostname : row[0].hostname,
			// 		port : row[0].port,
			// 		username : row[0].username,
			// 		password : row[0].password
			// 	});
			// });
			
		});

		return details;
}


export async function getSQLiteReportInfo(reportId){
		// let reportInfo = await
		// new Promise((resolve, reject) => {
			
		// 	let db = new sqlite3.Database(SQLITE3_DB_PATH);
		// 	db.all("SELECT * FROM reports r WHERE rowid = ?",[reportId], (rErr, rRows) => {
		// 		if(rErr !== null){
		// 			log.error(rRows);
		// 			//@TODO: Show table data log error
		// 			reject(rErr);
					
		// 		}
				
		// 		resolve(rRows[0]);
		// 	});
			
		// });

		return reportInfo;
}


/**
* Run report query
*
* @param string query
*/
export async function runQuery(query){
	
	const dbConDetails  = await getSQLiteDBConnectionDetails('boda');

	const hostname = dbConDetails.hostname;
	const port = dbConDetails.port;
	const username = dbConDetails.username;
	const password = dbConDetails.password;

	let results = [];
	
	// const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/boda`;
	// const client = new Client({
	// 	connectionString: connectionString,
	// });
		
	// client.connect((err) => {
	// 	if(err){
	// 		log.error(err);
	// 		client.end();
	// 		return err;
	// 	}
	// });

			
	// let results = await
	// new Promise((resolve, reject) => {
	// 	client.query(query)
	// 	.then( result => {
	// 		return resolve(result);
	// 	} )
	// 	.catch(e => {
	// 		//@TODO: Error notice
	// 		reject(e);
			
	// 	})
	// 	.then(() => client.end());
	// });	
	
	return results;
	
}

export async function getQueryFieldsInfo(query){
	let result = null;
	try{
		result = await runQuery(`SELECT * FROM (${query}) ttt LIMIT 0`);
		return result.fields;
	}catch(e){
		return {error: e}
	}

}

export function getSortAndFilteredQuery(query, columnNames, AGGridSortModel, AGGridFilterModel, AGGridColumns){
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
                //let filterValue= filterModel.filter;
				
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
				
                //if( filterType === 'contains' ){
				//	newQuery += ` qt."${col}" ~ '^((?!${value}).)*$' `                
                //}
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

        AGGridSortModel.forEach(function(model, idx){
            let col = model.colId;
            let dir = model.sort;
			
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


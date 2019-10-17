const log = window.require('electron-log');
const { Client, Pool } = window.require('pg');
const copyFrom = require('pg-copy-streams').from;
const path = window.require('path');
const queryHelper = window.require('./query-helpers');
/**
*
* @param csvFolder string 
* @param truncateTables boolean Truncate tables before load. Values are true or false
* @param callbacks {beforeFileLoad, afterFileLoad, beforeLoad, afterLoad}
*
*/
async function loadBodaCSVKPIsDataViaStream(csvFolder,truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
	
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
		
		let table = "pm.kpis";
		
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
	

	
}

exports.loadBodaCSVKPIsDataViaStream = loadBodaCSVKPIsDataViaStream;
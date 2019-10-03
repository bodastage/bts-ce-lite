const { Client, Pool } = window.require('pg');
const queryHelper = window.require('./query-helpers');
const fs = require("fs");

const BCF_2G_PARAMS = {
	technology: {required: true},
	ci: {required: true},
	cellname: {},
	siteid: {},
	carrier_layer: {},
	azimuth: {required: true},
	electrical_tilt: {},
	mechanical_tilt: {},
	lac: {},
	node: {required: true},
	bcch: {},
	trx_frequencies: {},
	antenna_beam: {},
	latitude: {required: true},
	longitude: {required: true},
	height: {},
	vendor: {},
	cell_type: {}, 
	bsic: {},
	bcc: {},
	ncc: {},
	mnc: {},
	mcc: {},
	cgi: {}
};


const BCF_3G_PARAMS = {
	technology: {required: true},
	ci: {required: true},
	cellname: {},
	siteid: {},
	carrier_layer: {},
	azimuth: {required: true},
	electrical_tilt: {},
	mechanical_tilt: {},
	lac: {},
	rac: {},
	sac: {}, 
	node: {required: true},
	psc: {},
	uarfcn: {},
	antenna_beam: {},
	latitude: {required: true},
	longitude: {required: true},
	height: {},
	vendor: {},
	cell_type: {}, 
	mnc: {},
	mcc: {},
	cgi: {},
	rncid: {}
};

const BCF_4G_PARAMS = {
	technology: {required: true},
	ci: {required: true},
	cellname: {},
	siteid: {},
	enodeb_id: {},
	carrier_layer: {},
	azimuth: {required: true},
	electrical_tilt: {},
	mechanical_tilt: {},
	tac: {},
	node: {required: true},
	pci: {},
	euarfcn: {},
	bandwidth: {},
	ecgi: {},
	mnc: {},
	mcc: {},
	antenna_beam: {},
	latitude: {required: true},
	longitude: {required: true},
	height: {},
	vendor: {},
	cell_type: {}
};

const BCF_5G_PARAMS = {
};

const TECHNOLOGIES = ["GSM", "UMTS", "WCDMA", "LTE", "CDMA2000"];

/*
* Return the database cell table given the technology name in lower case
*
* @param string technology
*
* @return string
*/
function getDataCellTable(technology){
	switch(technology){
		case '2g':
		case 'gsm':
			return "2g_cells";
		case '3g':
		case 'umts':
		case 'wcdma':
		case 'cdma2000':
			return "3g_cell"
		case '4g':
		case 'lte':
			return "4g_cell";
		case '5g':
		case 'nr':
			return "5g_cell";
		default:
			throw Error("Un-recognised technology. Expected gsm, umts, wcdma, lte, nr, 2g, 3g, 4g, or 5g")
			
	}
}

/**
* Get the expected parameter list for a vendor
*
* @param string technology 
*
* @return array
*/
function getTechParameterList(technology){
	switch(technology){
		case '2g':
		case 'gsm':
			return BCF_2G_PARAMS;
		case '3g':
		case 'umts':
		case 'wcdma':
			return BCF_3G_PARAMS;
		case '4g':
		case 'lte':
			return BCF_4G_PARAMS;
		case '5g':
		case 'nr':
			return BCF_5G_PARAMS;
		default:
			throw Error("Un-recognised technology. Expected gsm, umts, wcdma, lte, nr, 2g, 3g, 4g, or 5g")
			
	}
}

/**
* Generate INSERT queries for data
*
* @param array fields
* @param array values
*
* @return string 
*/
function generateParameterInsertQuery(fields, values){
	
	//make the fields lower case 
	fields = fields.map(v => v.toLowerCase());
	
	//Validate tech
	let tech = null;
	if(fields.indexOf("technology") === -1) throw Error("Technology field is missing");
	tech = values[fields.indexOf("technology")];
	if(tech.length === 0) throw Error("Technology value cannot be empty");

	//Validate ci
	let ci = null;
	if(fields.indexOf("ci") === -1) throw Error("ci field is missing");
	ci = values[fields.indexOf("ci")];
	if(ci.length === 0) throw Error("ci value cannot be empty");
	
	
	//Get database table for insertion
	let tableName = getDataCellTable(tech.toLowerCase());
	
	//Get list of std parameters for technology
	const paramNames = Object.keys(getTechParameterList(tech.toLowerCase()));
	
	let paramValues = paramNames.map(v => '');
	let insFields = [];						  
	let insValues = [];
	let updatePhrase = [];
	
	paramNames.forEach((p, i) => {
		//Skip parameter that are not there
		if(fields.indexOf(p) === -1 ) return;
		paramValues[i] = values[fields.indexOf(p)];
		updatePhrase.push(`${p} = EXCLUDED.${p}`);
	});
	
	let sql = `INSERT INTO plan_network."${tableName}"
		(${paramNames.join(",")})
	VALUES
		('${paramValues.join("','")}')
	 ON CONFLICT ON CONSTRAINT unq_ci_node_${tableName} DO UPDATE
	 SET 
		${updatePhrase.join(",")}
	`;
	
	return sql;

}


/**
* Returns a list of nbrs cells given the field list and value array
*
* @param array fields Array of fields 
* @param array values Array of row values
*
* @returns array
*/
function getNbrsFromValues(fields, values){
	//Get indices of nbr columns. These are field names that start with 
	//nbr_ or NBR_
	const nbrIndices = fields
		.map((v, i) => v.match(/^nbr_/i) ? i : -1 )
		.filter((v, i) => v > -1);
		
	let nbrList = [];
	nbrIndices.forEach((idxValue) => {
		if(values[idxValue].length > 0 ) nbrList.push(values[idxValue]);
	});
	
	return nbrList;
}

/*
* Generate nbr insert query
*
* @param array fields Array of fields 
* @param array values Array of row values
*
* @returns string SQL query
*/
function generateNbrInsertQuery(fields, values){
	//make the fields lower case 
	fields = fields.map(v => v.toLowerCase());
	const nbrList = getNbrsFromValues(fields, values);
	
	//Return null if there are no nbrs
	if(nbrList === null) return null;
	
	//Validate ci
	let ci = null;
	if(fields.indexOf("ci") === -1) throw Error("ci field is missing");
	ci = values[fields.indexOf("ci")];
	if(ci.length === 0) throw Error("ci value cannot be empty");
	
	
	let sql = "";
	nbrList.forEach(nbr_ci => {
		sql += `
		INSERT INTO plan_network."relations" 
		(svr_ci, nbr_ci) VALUES (${ci}, ${nbr_ci}) 
		ON CONFLICT ON CONSTRAINT unq_relations DO NOTHING;`;
	});
	
	return sql;
	
}


async function loadBodaCellFile(inputFile, truncateTables, beforeFileLoad, afterFileLoad, beforeLoad, afterLoad){
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
	
	var fileList = [];
	var fileIsDir = false;
	
	if(fs.lstatSync(inputFile).isDirectory()){
		fileIsDir = true;
		fileList = fs.readdirSync(inputFile,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	}else{
		fileList = [inputFile]
	}
	

	for (let i=0; i< fileList.length; i++) {
		let fileName = fileList[i];
		
		let filePath = fileIsDir ? path.join(inputFile, fileList[i]) : fileName;
		
		
		client = await pool.connect();
		if(client.processID === null){
			log.error('Failed to connect to database');
			return {status: "error", message: 'Failed to connect to database during boda cell file loading'};
		}
		
		
		let parameterList = [];
		//This is used to capture load error in onError Event
		let loadError = null;
		console.log("filePath:", filePath);
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
				const sql = generateParameterInsertQuery(parameterList, csvRow);
				await client.query(sql);
				
				//Insert relations
				const nbrSQL = generateNbrInsertQuery(parameterList, csvRow);
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
		if(loadError !== null) throw new Error(loadError, 'boda-cell-file.js');
		
		
	}

	if(typeof afterLoad === 'function'){
		afterLoad();
	}
}


exports.BCF_2G_PARAMS = BCF_2G_PARAMS;
exports.BCF_3G_PARAMS = BCF_3G_PARAMS;
exports.BCF_4G_PARAMS = BCF_4G_PARAMS;
exports.generateParameterInsertQuery = generateParameterInsertQuery;
exports.generateNbrInsertQuery = generateNbrInsertQuery;
exports.loadBodaCellFile = loadBodaCellFile;
exports.getTechParameterList  = getTechParameterList ;
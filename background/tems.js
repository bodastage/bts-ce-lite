const firstLine = window.require('firstline');
const lineReader = window.require('line-reader');
const queryHelper = window.require('./query-helpers');
const { Client, Pool } = window.require('pg');
const bcf = window.require('./boda-cell-file');

const TEMS_BCF_MAP = {
	"Cell":  "cellid",
	"Cell":  "cellname",
	"Lat" : "latitude",
	"Latitude" : "latitude",
	"Lon" : "longitude",
	"Longitude" : "longitude",
	"MCC" : "mcc",
	"MNC" : "mnc",
	"LAC" : "lac",
	"RA" : "rac",
	"CI" : "ci",
	"ANT_DIRECTION" : "azimuth",
	"ANT DIR" : "azimuth",
	"ANT ORIENTATION": "azimuth",
	"ANT_BEAM_WIDTH" : "beam_width",
	"ANT_TYPE": "antenna_type",
	"ANT_HEIGHT": "height",
	"ANT_TILT": "mechanical_tilt",
	"CELL_TYPE": "cell_type",
	"UARFCN": "uarfcn",
	"SC" : "psc",
	"RNC-ID": "rncid",
	"URA": "ura",
	"TIME_OFFSET": "",
	"CPICH_POWER": "",
	"MAX_TX_POWER": "",
	"NODE_B": "",
	"NODE_B_STATUS": "",
	"ARFCN": "",
	"BSIC": "bsic"
};

const TEMS_BCG_MAP_2G = {
	"Network_CellID":  "siteid",
	"Cell":  "cellname",
	"Lat" : "latitude",
	"Latitude" : "latitude",
	"Lon" : "longitude",
	"Longitude" : "longitude",
	"MCC" : "mcc",
	"MNC" : "mnc",
	"LAC" : "lac",
	"RA" : "rac",
	"CI" : "ci",
	"ANT_DIRECTION" : "azimuth",
	"ANT DIR" : "azimuth",
	"ANT ORIENTATION": "azimuth",
	"ANT_BEAM_WIDTH" : "antenna_beam",
	"ANT_TYPE": "antenna_type",
	"ANT_HEIGHT": "height",
	"ANT_TILT": "mechanical_tilt",
	"CELL_TYPE": "cell_type",
	"ARFCN": "bcch",
	"BSIC": "bsic"
}

/**
* Determine TEMS file format
* 
* @param string fileName
*/
async function getFileFormat(fileName){
	const fl = await firstLine(fileName);
	console.log("fl:",fl);
	
	if('<?xml version="1.0" encoding="UTF-8"?>' == fl.trim()) return 'XML';
	
	if(fl.match(/\d+\s+TEMS_-_Cell_names/g)) return 'CEL';
	
	return null;
}



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
			throw new Error("Un-recognised technology. Expected gsm, umts, wcdma, lte, nr, 2g, 3g, 4g, or 5g")
			
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
	if(fields.indexOf("ci") === -1) throw new Error("ci field is missing");
	ci = values[fields.indexOf("ci")];
	if(ci.length === 0) throw Error("ci value cannot be empty");
	
	
	//Get database table for insertion
	let tableName = getDataCellTable(tech.toLowerCase());
	
	//Get list of std parameters for technology
	const paramNames = Object.keys(bcf.getTechParameterList(tech.toLowerCase()));
	
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
		(${paramNames.filter((v, i) => paramValues[i].length > 0).join(",")})
	VALUES
		('${paramValues.filter((v, i) => paramValues[i].length > 0).join("','")}')
	 ON CONFLICT ON CONSTRAINT unq_ci_node_${tableName} DO UPDATE
	 SET 
		${updatePhrase.join(",")}
	`;
	
	console.log(sql)
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



async function loadCELFile(fileName, truncateTables){

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
		await client.query(`TRUNCATE plan_network."relations" RESTART IDENTITY CASCADE`);
		
		client.release();
	}
	

	let filePath = fileName;
	let parameterList = [];
	let bcfFields = [];
	let valueIndex = [];
	
	let lineCnt = 0;
	lineReader.eachLine(fileName, async function(line) {
		//console.log(line);
		lineCnt += 1;
		if(lineCnt === 1) return;
		if(lineCnt === 2) {
			parameterList = line.split("\t");
			bcfFields = parameterList.map( p => { 
				return typeof TEMS_BCG_MAP_2G[p] === 'undefined' ? null : TEMS_BCG_MAP_2G[p];
			}).filter(v => v != null)
			valueIndex = parameterList.map( (p, i) => { 
				return TEMS_BCG_MAP_2G[p] === undefined ? -1 : i;
			}).filter(v => v > -1);
			
			if(bcfFields.indexOf("bsic") > -1){
				bcfFields.push("technology");
				bcfFields.push("cgi");
				bcfFields.push("node");
			}
			
		}
		
		values = line.split("\t");
		bcfValues = valueIndex.map(v => values[v]);
		
		if(bcfFields.indexOf("bsic") > -1){			
			bcfValues.push("gsm");
			
			//cgi
			bcfValues[bcfFields.indexOf("cgi")] = `${bcfValues[bcfFields.indexOf("mcc")]}-${bcfValues[bcfFields.indexOf("mnc")]}-${bcfValues[bcfFields.indexOf("lac")]}-${bcfValues[bcfFields.indexOf("ci")]}`
			bcfValues.push("BSC");
		}
		
		console.log("bcfFields:", bcfFields);
		console.log("bcfValues:", bcfValues);
		const InsertQry = generateParameterInsertQuery(bcfFields, bcfValues);
		await queryHelper.runQuery(InsertQry);
		
	});
}

function loadXMLFile(fileName){
	
}

async function loadTEMSFile(fileName){
	const fileFormat = await getFileFormat(fileName);
	
	if(fileFormat === null) throw new Error("Unknow TEMS file format.");
	
	if(fileFormat === 'CEL'){
		await loadCELFile(fileName);
	}
	
	if(fileFormat === 'XML'){
		loadXMLFile(fileName);
	}
}


exports.loadTEMSFile = loadTEMSFile;
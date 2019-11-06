const firstLine = window.require('firstline');
const lineReader = window.require('line-reader');
const queryHelper = window.require('./query-helpers');
const { Client, Pool } = window.require('pg');
const bcf = window.require('./boda-cell-file');
const xpath = window.require('xpath');
const dom = window.require('xmldom').DOMParser;
  
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

const TEMS_BCF_MAP_2G = {
	"network_cellid":  "siteid",
	"cell":  "cellname",
	"lat" : "latitude",
	"latitude" : "latitude",
	"lon" : "longitude",
	"longitude" : "longitude",
	"mcc" : "mcc",
	"mnc" : "mnc",
	"lac" : "lac",
	"ra" : "rac",
	"ci" : "ci",
	"ant_direction" : "azimuth",
	"ant dir" : "azimuth",
	"ant orientation": "azimuth",
	"ant_beam_width" : "antenna_beam",
	"ant_type": "antenna_type",
	"ant_height": "height",
	"ant_tilt": "mechanical_tilt",
	"cell_type": "cell_type",
	"arfcn": "bcch",
	"bsic": "bsic"
}

const TEMS_BCF_MAP_3G = {
	"network_cellid":  null,
	"cell":  "cellname",
	"lat" : "latitude",
	"latitude" : "latitude",
	"lon" : "longitude",
	"longitude" : "longitude",
	"mcc" : "mcc",
	"mnc" : "mnc",
	"lac" : "lac",
	"ra" : "rac",
	"ci" : "ci",
	"ant_direction" : "azimuth",
	"ant dir" : "azimuth",
	"ant orientation": "azimuth",
	"ant_beam_width" : "antenna_beam",
	"ant_type": "antenna_type",
	"ant_height": "height",
	"ant_tilt": "mechanical_tilt",
	"cell_type": "cell_type",
	"uarfcn": "uarfcn",
	"rnc-id": "rncid",
	"sc": "psc",
	"c-id": "ci",
	"ura": "ura",
	"time_offset": null,
	"cpich_power": "cpich_power",
	"max_tx_power": "max_tx_power",
	"node_b": "siteid",
	"node_b_status": null,
}

/**
* Determine TEMS file format
* 
* @param string fileName
*/
async function getFileFormat(fileName){
	const fl = await firstLine(fileName);
	
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
			return "3g_cells"
		case '4g':
		case 'lte':
			return "4g_cells";
		case '5g':
		case 'nr':
			return "5g_cells";
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

		paramValues[i] = values[fields.indexOf(p)] === undefined ? "" : values[fields.indexOf(p)];
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
	let line2 = "";
	lineReader.eachLine(fileName, async function(line) {
		//console.log(line);
		lineCnt += 1;
		if(lineCnt === 1) return;
		if(lineCnt === 2) {
			parameterList = line.split("\t").map(v => v.toLowerCase());
		}
		
		values = line.split("\t");
	
		if(parameterList.indexOf("arfcn") > -1 && values[parameterList.indexOf("arfcn")].length > 0){
			bcfFields = parameterList.map( p => { 
				return typeof TEMS_BCF_MAP_2G[p] === 'undefined' ? null : TEMS_BCF_MAP_2G[p];
			}).filter(v => v != null)
			valueIndex = parameterList.map( (p, i) => { 
				return TEMS_BCF_MAP_2G[p] === undefined ? -1 : i;
			}).filter(v => v > -1);
			
			//Add extra fields
			bcfFields.push("technology");
			bcfFields.push("cgi");
			bcfFields.push("node");
			
			//Add extra field values
			bcfValues = valueIndex.map(v => values[v]);
				
			bcfValues.push("gsm");
			//construct cgi
			bcfValues[bcfFields.indexOf("cgi")] = `${bcfValues[bcfFields.indexOf("mcc")]}-${bcfValues[bcfFields.indexOf("mnc")]}-${bcfValues[bcfFields.indexOf("lac")]}-${bcfValues[bcfFields.indexOf("ci")]}`
			bcfValues.push("BSC");
			
		}

		if(parameterList.indexOf("uarfcn") > -1 && values[parameterList.indexOf("uarfcn")].length > 0){
			bcfFields = parameterList.map( p => { 
				return typeof TEMS_BCF_MAP_3G[p] === 'undefined' ? null : TEMS_BCF_MAP_3G[p];
			}).filter(v => v != null)
			valueIndex = parameterList.map( (p, i) => { 
				return TEMS_BCF_MAP_3G[p] === undefined ? -1 : i;
			}).filter(v => v > -1);
			
			//Add extra fields
			bcfFields.push("technology");
			bcfFields.push("cgi");
			bcfFields.push("node");
			
			bcfValues = valueIndex.map(v => values[v]);
			
			//Add extra field values
			bcfValues.push("umts");
			
			//cgi
			bcfValues[bcfFields.indexOf("cgi")] = `${bcfValues[bcfFields.indexOf("mcc")]}-${bcfValues[bcfFields.indexOf("mnc")]}-${bcfValues[bcfFields.indexOf("lac")]}-${bcfValues[bcfFields.indexOf("ci")]}`
			bcfValues.push("RNC");
			
		}
		
		const InsertQry = generateParameterInsertQuery(bcfFields, bcfValues);
		await queryHelper.runQuery(InsertQry);
		
	});
}

/*
* Load XML file
* 
* @param string fileName
*/
async function loadXMLFile(fileName){	//@TODO: Confirm file is XML
	
	var xml = fs.readFileSync(fileName).toString();
	var doc = new dom().parseFromString(xml)
	//var nodes = xpath.select("//GSM/CELL_LIST", doc);
	var nodes = xpath.evaluate("//GSM/CELL_LIST/GSM_CELL", doc, null, xpath.XPathResult.ANY_TYPE, null);
	//console.log(nodes[0]);
	
	const gsmBcfFields = [
		'technology',
		'node',
		'cellname',
		'cell_type',
		'ncc',
		'bcc',
		'bsic',
		'bcch',
		'carrier_layer',
		'mcc',
		'mnc',
		'lac',
		'ci',
		'cgi',
		'latitude',
		'longitude',
		'azimuth',
		'antenna_beam',
		'height'
	];
	
	
	const wcdmaBcfFields = [
		'technology',
		'ci',
		'cellname',
		'siteid',
		'carrier_layer',
		'azimuth',
		'electrical_tilt',
		'mechanical_tilt',
		'lac',
		'rac',
		'sac',
		'node',
		'psc',
		'uarfcn',
		'antenna_beam',
		'latitude',
		'longitude',
		'azimuth',
		'antenna_beam',
		'height',
		'vendor',
		'cell_type',
		'mnc',
		'mcc',
		'rncid'
	];
	
	const lteBcfFields = [
		"technology",
		"cellname",
		"siteid",
		"enodeb_id",
		"carrier_layer",
		"azimuth",
		"electrical_tilt",
		"mechanical_tilt",
		"tac",
		"node",
		"pci",
		"euarfcn",
		"bandwidth",
		"ecgi",
		"mnc",
		"mcc",
		"antenna_beam",
		"latitude",
		"longitude",
		"height",
		"vendor",
		"cell_type",
		"ci",
		"localcellid"
	]
	
	//GSM_CELL
	node = nodes.iterateNext()
	while(node){
//		console.log(node);
		const children = node.childNodes;

		let paramValues = {};
		
		for(var i = 0 ; i < children.length; i++){
			if( children[i].localName == undefined) continue;
			const child = children[i];
			
			if(child.nodeName === 'CELLNAME') paramValues['cellname'] = child.firstChild.data;
			
			if(child.nodeName === 'CELL_TYPE') paramValues['cell_type'] = child.firstChild.data;
			
			//BSIC
			if(child.nodeName === 'BSIC'){
				const children2 = child.childNodes;
				for(var j = 0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;

					if(child2.nodeName === 'BCC') paramValues['bcc'] = child2.firstChild.data;
					if(child2.nodeName === 'NCC') paramValues['ncc'] = child2.firstChild.data;
				}
				
				paramValues['bsic'] = `${paramValues["ncc"]}${paramValues["bcc"]}`
			}
			
			
			//CHANNEL_INFO
			if(child.nodeName === 'CHANNEL_INFO'){
				const children2 = child.childNodes[1].childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'ARFCN') paramValues['bcch'] = child2.firstChild.data;
					if(child2.nodeName === 'BAND') paramValues['carrier_layer'] = child2.firstChild.data;
				}
			}
			
			//CGI
			if(child.nodeName === 'CGI'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'MCC') paramValues['mcc'] = child2.firstChild.data;
					if(child2.nodeName === 'MNC') paramValues['mnc'] = child2.firstChild.data;
					if(child2.nodeName === 'LAC') paramValues['lac'] = child2.firstChild.data;
					if(child2.nodeName === 'CI') paramValues['ci'] = child2.firstChild.data;
				}
				
				paramValues['cgi'] = `${paramValues["mcc"]}-${paramValues["mnc"]}-${paramValues["lac"]}-${paramValues["ci"]}`
			}
			
			//POSITION
			if(child.nodeName === 'POSITION'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'LATITUDE') paramValues['latitude'] = child2.firstChild.data;
					if(child2.nodeName === 'LONGITUDE') paramValues['longitude'] = child2.firstChild.data;
				}
			}
			
			//ANTENNA
			if(child.nodeName === 'ANTENNA'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'DIRECTION') paramValues['azimuth'] = child2.firstChild.data;
					if(child2.nodeName === 'BEAM_WIDTH') paramValues['antenna_beam'] = child2.firstChild.data;
					if(child2.nodeName === 'HEIGHT') paramValues['height'] = child2.firstChild.data;
				}
			}
		}
		
		
		paramValues['technology'] = 'gsm';
		paramValues['node'] = 'BSC';
		
		const bcfGSMValues  = gsmBcfFields.map(v => paramValues[v]);
			
		const InsertQry = generateParameterInsertQuery(gsmBcfFields, bcfGSMValues);
		await queryHelper.runQuery(InsertQry);

		node = nodes.iterateNext()
	}
	
	
	//WCDMA 
	var nodes = xpath.evaluate("//WCDMA/CELL_LIST/WCDMA_CELL", doc, null, xpath.XPathResult.ANY_TYPE, null);
	node = nodes.iterateNext()
	while(node){
//		console.log(node);
		const children = node.childNodes;

		let paramValues = {};
		
		for(var i = 0 ; i < children.length; i++){
			if( children[i].localName == undefined) continue;
			const child = children[i];
			
			if(child.nodeName === 'CELLNAME') paramValues['cellname'] = child.firstChild.data;
			
			if(child.nodeName === 'CELL_TYPE') paramValues['cell_type'] = child.firstChild.data;
			
			if(child.nodeName === 'LOCALCELLID') paramValues['localcellid'] = child.firstChild.data;
			
			if(child.nodeName === 'UARFCN_DL') paramValues['uarfcn'] = child.firstChild.data;
			
			if(child.nodeName === 'RNC_ID') paramValues['rncid'] = child.firstChild.data;
			
			if(child.nodeName === 'SC') paramValues['psc'] = child.firstChild.data;
			
			if(child.nodeName === 'CPICH_POWER') paramValues['cpich_power'] = child.firstChild.data;

			if(child.nodeName === 'NODE_B') { 
				paramValues['siteid'] = child.firstChild.data;
				paramValues['sitename'] = child.firstChild.data;
			}
			
			if(child.nodeName === 'NODE_B_STATUS') paramValues['status'] = child.firstChild.data;

			if(child.nodeName === 'URA') paramValues['ura'] = child.firstChild.data;
			//
			
			//CGI
			if(child.nodeName === 'CGI'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'MCC') paramValues['mcc'] = child2.firstChild.data;
					if(child2.nodeName === 'MNC') paramValues['mnc'] = child2.firstChild.data;
					if(child2.nodeName === 'LAC') paramValues['lac'] = child2.firstChild.data;
					if(child2.nodeName === 'CI') paramValues['ci'] = child2.firstChild.data;
				}
				
				paramValues['cgi'] = `${paramValues["mcc"]}-${paramValues["mnc"]}-${paramValues["lac"]}-${paramValues["ci"]}`
			}
			
			//POSITION
			if(child.nodeName === 'POSITION'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'LATITUDE') paramValues['latitude'] = child2.firstChild.data;
					if(child2.nodeName === 'LONGITUDE') paramValues['longitude'] = child2.firstChild.data;
				}
			}
			
			//ANTENNA
			if(child.nodeName === 'ANTENNA'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'DIRECTION') paramValues['azimuth'] = child2.firstChild.data;
					if(child2.nodeName === 'BEAM_WIDTH') paramValues['antenna_beam'] = child2.firstChild.data;
					if(child2.nodeName === 'HEIGHT') paramValues['height'] = child2.firstChild.data;
				}
			}
		}
		
		paramValues['technology'] = 'umts';
		paramValues['node'] = paramValues['rncid'] || "RNC";
		
		const bcfWCDMAValues  = wcdmaBcfFields.map(v => paramValues[v] || '');

		const InsertQry = generateParameterInsertQuery(wcdmaBcfFields, bcfWCDMAValues);
		await queryHelper.runQuery(InsertQry);

		node = nodes.iterateNext()
	}
	
	//LTE
	var nodes = xpath.evaluate("//LTE/CELL_LIST/LTE_CELL", doc, null, xpath.XPathResult.ANY_TYPE, null);
	node = nodes.iterateNext()
	while(node){
//		console.log(node);
		const children = node.childNodes;

		let paramValues = {};
		
		for(var i = 0 ; i < children.length; i++){
			if( children[i].localName == undefined) continue;
			const child = children[i];
			
			if(child.nodeName === 'CELLNAME') paramValues['cellname'] = child.firstChild.data;
			
			if(child.nodeName === 'CELL_TYPE') paramValues['cell_type'] = child.firstChild.data;
			
			if(child.nodeName === 'LOCALCELLID') paramValues['localcellid'] = child.firstChild.data;
			
			//pci
			if(child.nodeName === 'PCI') paramValues['pci'] = child.firstChild.data;
			if(child.nodeName === 'PHYSICAL_LAYER_CELL_ID') paramValues['pci'] = child.firstChild.data;
			
			
			if(child.nodeName === 'EARFCN_DL') paramValues['euarfcn'] = child.firstChild.data;
			
			if(child.nodeName === 'TA') paramValues['tac'] = child.firstChild.data;
			
			if(child.nodeName === 'TIME_OFFSET') paramValues['time_offset'] = child.firstChild.data;
			
			if(child.nodeName === 'RS_POWER') paramValues['rs_power'] = child.firstChild.data;
			
			if(child.nodeName === 'MAX_TX_POWER') paramValues['max_tx_power'] = child.firstChild.data;


			if(child.nodeName === 'ENODE_B') { 
				paramValues['siteid'] = child.firstChild.data;
				paramValues['enodeb_id'] = child.firstChild.data;
				paramValues['sitename'] = child.firstChild.data;
			}
			
			if(child.nodeName === 'ENODE_B_STATUS') paramValues['status'] = child.firstChild.data;

			//CGI
			if(child.nodeName === 'LTE_CGI'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'MCC') paramValues['mcc'] = child2.firstChild.data;
					if(child2.nodeName === 'MNC') paramValues['mnc'] = child2.firstChild.data;
					if(child2.nodeName === 'TAC') paramValues['tac'] = child2.firstChild.data;
				}
				
				paramValues['cgi'] = `${paramValues["mcc"]}-${paramValues["mnc"]}-${paramValues["lac"]}-${paramValues["ci"]}`
			}
			
			//POSITION
			if(child.nodeName === 'POSITION'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'LATITUDE') paramValues['latitude'] = child2.firstChild.data;
					if(child2.nodeName === 'LONGITUDE') paramValues['longitude'] = child2.firstChild.data;
				}
			}
			
			//ANTENNA
			if(child.nodeName === 'ANTENNA'){
				const children2 = child.childNodes;
				for(var j =0; j < children2.length; j++){
					const child2 = children2[j];
					
					if( typeof child2.localName === 'undefined') continue;
					
					if(child2.nodeName === 'DIRECTION') paramValues['azimuth'] = child2.firstChild.data;
					if(child2.nodeName === 'BEAM_WIDTH') paramValues['antenna_beam'] = child2.firstChild.data;
					if(child2.nodeName === 'HEIGHT') paramValues['height'] = child2.firstChild.data;
				}
			}
		}
		
		paramValues['technology'] = 'lte';
		paramValues['node'] = paramValues['siteid'] || "ENODEB";
		
		paramValues['ci'] = paramValues['ci'] || paramValues['pci'];
		paramValues['localcellid'] = paramValues['localcellid'] === undefined ? "0" : '';
		
		const bcfLTEValues  = lteBcfFields.map(v => paramValues[v] === undefined ? "" : paramValues[v]);
		
		const insertQry = generateParameterInsertQuery(lteBcfFields, bcfLTEValues);

		await queryHelper.runQuery(insertQry);

		node = nodes.iterateNext()
	}
}

async function loadTEMSFile(fileName, clearTables){
	const fileFormat = await getFileFormat(fileName);
	
	if(fileFormat === null) throw new Error("Unknown TEMS file format.");
	
	if(clearTables){
		
		await queryHelper.runQuery(`TRUNCATE plan_network."2g_cells" RESTART IDENTITY CASCADE`);
		await queryHelper.runQuery(`TRUNCATE plan_network."3g_cells" RESTART IDENTITY CASCADE`);
		await queryHelper.runQuery(`TRUNCATE plan_network."4g_cells" RESTART IDENTITY CASCADE`);
		await queryHelper.runQuery(`TRUNCATE plan_network."relations" RESTART IDENTITY CASCADE`);
	}
	
	if(fileFormat === 'CEL'){
		await loadCELFile(fileName);
	}
	
	if(fileFormat === 'XML'){
		await loadXMLFile(fileName);
	}
}


exports.loadTEMSFile = loadTEMSFile;
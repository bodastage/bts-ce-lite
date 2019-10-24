const XLSX = window.require('xlsx');
const fs = window.require('fs');
const log = window.require('electron-log');
const BG_UTILS = window.require('./bg-utils');



function numberParser(str) {
    var newValue = str;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(str);
    }
    return (isNaN(valueAsNumber) || valueAsNumber === null) ? str : valueAsNumber;
}

function  checkStyleCondition(lValue, op, rValue){
	if(op === 'equal'){
		return lValue == rValue;
	}

	if(op === 'not_equal'){
		return lValue != rValue;
	}
	
	if(op === 'greater'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue > rValue;
	}		
	
	if(op === 'less'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue < rValue;
	}
	
	if(op === 'greater_or_equal'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue >= rValue;
	}
	
	if(op === 'less_or_equal'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue <= rValue;
	}
	
	//Comma separated range
	if(op === 'in'){
		return rValue.split(',').indexOf(lValue) >= 0;
	}
	
	//Comma separated range
	if(op === 'not_in'){
		return rValue.split(',').indexOf(lValue) == -1;
	}
	
	if(op === 'end_with'){
		return new RegExp(`${rValue}\$`).test(lValue);
	}
	
	if(op === 'starts_with'){
		return new RegExp(`^${rValue}`).test(lValue);
	}
	
	if(op === 'contains'){
		return new RegExp(`.*${rValue}.*`).test(lValue);
	}
	
	if(op === 'regexp'){
		return new RegExp(rValue).test(lValue);
	}
			
	if(op === 'length'){
		
		return lValue === null ? false : lValue.length === rValue;
	}
	
	if(op === 'length_less'){
		return lValue === null ? false : lValue.length < rValue;
	}
	
	if(op === 'length_greater'){
		return lValue === null ? false : lValue.length > rValue;
	}
	
	if(op === 'is_empty'){
		return lValue.length === 0
	}
	
	if(op === 'between'){
		return lValue > rValue[0] && lValue < rValue[1]
	}
	
	if(op === 'not_between'){
		return  !(lValue > rValue[0] && lValue < rValue[1])
	}
	
	if(op === 'is_not_empty'){
		return lValue.length > 0
	}
	
	return false;

}	



//@TODO: Needs refactoring
function createSemiDonutPolygonPoints(
	intNumSteps, 
	floAngleStep, 
	floLongitude, 
	floLatitude, 
	floAntAzim, 
	floCellRadiusOuter, 
	floCellRadiusInner, 
	floCellHeight, 
	EarthRadius, 
	PI) {


	let strSemiDonutPolygonPoints = "";

	let floAntAzimStart = floAntAzim - intNumSteps / 2 * floAngleStep;
	for(var  i = 0; i <  intNumSteps; i++ ){
		const pointX = (floLatitude + 90 * floCellRadiusOuter * Math.cos(((floAntAzimStart + i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius));
		const pointY = floLongitude + 90 * floCellRadiusOuter * Math.sin(((floAntAzimStart + i * floAngleStep) * PI / 180)) / 
		(PI / 2 * EarthRadius * Math.cos(((floLatitude + (floLatitude + 90 * floCellRadiusOuter * Math.cos(((floAntAzimStart + i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius))) / 2) * PI / 180));

		strSemiDonutPolygonPoints = strSemiDonutPolygonPoints + pointY + "," + pointX + "," + floCellHeight + " ";
	}

	floAntAzimStart = floAntAzim + intNumSteps / 2 * floAngleStep;
	for( var i = 0; i< intNumSteps; i++){
		const pointX = (floLatitude + 90 * floCellRadiusInner * Math.cos(((floAntAzimStart - i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius));
		const pointY = floLongitude + 90 * floCellRadiusInner * Math.sin(((floAntAzimStart - i * floAngleStep) * PI / 180)) / 
		(PI / 2 * EarthRadius * Math.cos(((floLatitude + (floLatitude + 90 * floCellRadiusInner * Math.cos(((floAntAzimStart - i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius))) / 2) * PI / 180));
		
		strSemiDonutPolygonPoints = strSemiDonutPolygonPoints + pointY + "," + pointX + "," + floCellHeight + " ";
	}
	
	// closing the polygon with initial/end point
	i = 0
	floAntAzimStart = floAntAzim - intNumSteps / 2 * floAngleStep;
	const pointX = (floLatitude + 90 * floCellRadiusOuter * Math.cos(((floAntAzimStart + i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius));
	const pointY = floLongitude + 90 * floCellRadiusOuter * Math.sin(((floAntAzimStart + i * floAngleStep) * PI / 180)) / 
		(PI / 2 * EarthRadius * Math.cos(((floLatitude + (floLatitude + 90 * floCellRadiusOuter * Math.cos(((floAntAzimStart + i * floAngleStep) * PI / 180)) / (PI / 2 * EarthRadius))) / 2) * PI / 180));
	strSemiDonutPolygonPoints = strSemiDonutPolygonPoints + pointY + "," + pointX + "," + floCellHeight + " ";
	
	return strSemiDonutPolygonPoints;

}



/*
* Generate KML/Z file
* 
* @param string type KML or KMZ
* @param object options 
*/
async function generate(options, type){
	//console.log("kml options: ", options);
	//const fileType = type || 'kml';
	
	//Generated file name
	let fileName = path.join(app.getPath('downloads'), 'boda-lite.kml');;
	let headers = [];
	
	const dataFile = options.dataFile || null; 
	if(dataFile === null ) throw new Error("Data file not provided");
	
	var workbook = XLSX.readFile(dataFile);
	
	var firstSheetName = workbook.SheetNames[0];
	var worksheet = workbook.Sheets[firstSheetName];
	var range = XLSX.utils.decode_range(worksheet['!ref']);
	
	let R = 0; //first row
	for(var C = range.s.c; C <= range.e.c; ++C) {
		var cellAddress = {c:C, r:R};

		/* if an A1-style address is needed, encode the address */
		var cellRef = XLSX.utils.encode_cell(cellAddress);
		var cell = worksheet[cellRef];
		headers.push(cell.v);
	}
	
	function getUniqueValuesForField(fieldName, filter){
		let values = [];
		const C = headers.indexOf(fieldName);
		for(var R = range.s.r + 1; R <= range.e.r; ++R) {
			
			//Check filter 
			let filterStatus = true;
			const filterKeys = Object.keys(filter);
			for(var k = 0; k < filterKeys.length; k++ ){
				const filterKey = filterKeys[k];
				const filterVal = filter[filterKey];
				const keyIndex = headers.indexOf(filterKey);
				
				const rowColVal= worksheet[XLSX.utils.encode_cell({c: keyIndex, r:R})].v;

				if(filterVal !== rowColVal) { filterStatus = false; break } //skip this row's values
			}
			
			//skill row
			if(!filterStatus) continue;
			
			var cellAddress = {c:C, r:R};

			/* if an A1-style address is needed, encode the address */
			var cellRef = XLSX.utils.encode_cell(cellAddress);
			var cell = worksheet[cellRef];
			
			//Collect headers
			if(values.indexOf(cell.v) < 0 ) values.push(cell.v);

		}
		
		return  values
	}
	
	const latitudeIndex = headers.indexOf(options.latitudeField);
	const longitudeIndex = headers.indexOf(options.longitudeField);
	const azimuthIndex = headers.indexOf(options.azimuthField);
	const cellLabelIndex = headers.indexOf(options.cellLabelField);
	const EARTH_RADIUS_KM = 6371*1000; //km
	
	function getPolygonCoordinates(latitude, longitude, azimuth, radius, height, intNumSteps){
		//const floAngleStep = 10; //azimuth/intNumSteps;
		//const floAntAzimStart = azimuth + (intNumSteps/2) * floAngleStep;
		//let coordinates = [];
		//for(var i = 0; i < intNumSteps; i++){
		//	let lat = (latitude + 90 * radius * Math.cos(((floAntAzimStart - i * floAngleStep) * Math.PI / 180)) / (Math.PI / 2 * EARTH_RADIUS_KM));
		//	let lon = longitude + 90 * radius * Math.sin(((floAntAzimStart + i * floAngleStep) * Math.PI / 180)) / 
		//		(Math.PI / 2 * EARTH_RADIUS_KM * Math.cos(((latitude + (latitude + 90 * radius * Math.cos(((floAntAzimStart + i * floAngleStep) * Math.PI / 180)) / (Math.PI / 2 * EARTH_RADIUS_KM))) / 2) * Math.PI / 180));
		//	
		//	coordinates.push([lon, lat])			
		//}
		//
		////add starting coordinates to close polygon
		//coordinates.push(coordinates[0])	
		

		//intNumSteps, 
		//floAngleStep, 
		//floLongitude, 
		//floLatitude, 
		//floAntAzim, 
		//floCellRadiusOuter, 
		//floCellRadiusInner, 
		//floCellHeight, 		
		const coordinates =  createSemiDonutPolygonPoints( 5, 10, longitude, latitude, azimuth, radius, 0, height, EARTH_RADIUS_KM, Math.PI);

		return coordinates;
	}
	
	function hexColorToKML(hex){
		if(hex === null) return "";
		const hx = hex.replace("#","")
		var r = hx.slice(0,2)
		var g = hx.slice(2,4)
		var b = hx.slice(4)
		return "ff" + `${b}${g}${r}`
	}
	
	
	function conditionTrue(condition, currentRow){

		if(condition.type === 'group'){
			const childrenIds = Object.keys(condition.children1);
			const conjuction = condition.properties.condition;
			
			//AND - start with true
			//OR - start with false 
			let groupResult = conjuction === 'AND' ? true : false;
			for(var p = 0; p < childrenIds.length; p++){
				const pId = childrenIds[p];
				const r = conditionTrue(condition["children1"][pId], currentRow);
				
				groupResult = conjuction === 'AND' ? (groupResult && r) : (groupResult || r);
			}
			
			return groupResult;
			
		}
		
		if(condition.type === 'rule'){
			const field = condition.properties.field;
			const c = headers.indexOf(field);
			const lValue = worksheet[XLSX.utils.encode_cell({c:c, r:currentRow})].v;
			
			const operator = condition.properties.operator;
			
			const value = condition.properties.value[0];
			const valueSrc = condition.properties.valueSrc[0];
			
			let rValue = value;
			if(valueSrc === 'field'){
				const c2 = headers.indexOf(value);
				rValue = worksheet[XLSX.utils.encode_cell({c:c2, r:currentRow})].v;
			}

			return checkStyleCondition(lValue, operator, rValue);
			
		}
		
		return false;
	}
	
	//Get height, color and radius values
	function getSomeValue(valObj, r){
		
		//ValueType == Value
		if( valObj.valueType === 'Value') return valObj.value;
		
		if( valObj.valueType === 'Field'){
			const c = headers.indexOf(valObj.value);
			return worksheet[XLSX.utils.encode_cell({c:c, r:r})].v
		}
		
		if( valObj.valueType === 'Condition'){
			
			const conditions = valObj.value;
			for(var i = 0; i < conditions.length; i++){
				const condition = conditions[i];
				
				if(conditionTrue(condition.tree, r)){
					let condVal = condition.value
					
					if(condition.valueType === 'Field'){
						const fieldIndex = headers.indexOf(condition.value);
						return worksheet[XLSX.utils.encode_cell({c:fieldIndex, r:r})].v;
					}else{
						return condition.value;
					}
					
				}
			}
		}
		//
		
		return null;
		
	}
	
	function processFolders(folders, stream, filter){
			if(folders.length === 0) { 
				for(var R = range.s.r + 1; R <= range.e.r; ++R) {
					//for(var C = range.s.c; C <= range.e.c; ++C) {
					//	var cellAddress = {c:C, r:R};
					//	var cellRef = XLSX.utils.encode_cell(cellAddress);
					//	var cell = worksheet[cellRef];
					//	
					//}
					
					//DEBUG: STOP HERE FOR TESTING 
					//if(R === 2 ) return;
					
					let filterStatus = true; // true when there is a match
					
					//Check filter 
					const filterKeys = Object.keys(filter);
					for(var k = 0; k < filterKeys.length; k++ ){
						const filterKey = filterKeys[k];
						const filterVal = filter[filterKey];
						const keyIndex = headers.indexOf(filterKey);
						const rowColVal= worksheet[XLSX.utils.encode_cell({c: keyIndex, r:R})].v;

						if(filterVal !== rowColVal) { filterStatus = false; break } //skip this row's values
					}
					
					//skill row
					if(!filterStatus) continue;
					
					const latitude = worksheet[XLSX.utils.encode_cell({c:latitudeIndex, r:R})].v;
					const longitude = worksheet[XLSX.utils.encode_cell({c:longitudeIndex, r:R})].v;
					const azimuth = worksheet[XLSX.utils.encode_cell({c:azimuthIndex, r:R})].v;
					const cellLabel = worksheet[XLSX.utils.encode_cell({c:cellLabelIndex, r:R})].v ;
					const height = getSomeValue(options.height, R);
					const azSteps = 6;
					const radius = getSomeValue(options.radius, R);
					const color = hexColorToKML(getSomeValue(options.color, R)); //hexColorToAHex('#ff00ff');
					let description = "";
					
					if(options.descFields.length > 0){
						description = "<table>";
						for(var dIdx =0; dIdx < options.descFields.length; dIdx++){
							const dF = options.descFields[dIdx];
							const fI = headers.indexOf(dF);
							
							let dV = "";
							try{
								dV = worksheet[XLSX.utils.encode_cell({c: fI, r: R})].v ;
							}catch(e){
								log.error(e)
							}
							description += `<tr><td>${dF}</td><td>${dV}</td></tr>`
							
						}
						description += "</table>";
					}
					
					//Generate sector coordinates
					const polygonCoords = getPolygonCoordinates(latitude, longitude, azimuth, radius, height, azSteps );
					
					//Open Folder for cell
					stream.write('<Folder>\n');
					stream.write(`<name>${cellLabel}</name>\n`);
					
					stream.write('<Placemark>\n');
					stream.write(`<name><![CDATA[${cellLabel}]]></name>\n`);
					stream.write(`<description>${description}</description>\n`);
					
					//Style 
					stream.write('<Style>\n');
					stream.write('<PolyStyle>\n');
					stream.write(`<color>${color}</color>\n`);
					stream.write(`<colorMode>normal</colorMode>\n`);
					stream.write(`<fill>1</fill>\n`);
					stream.write('</PolyStyle>\n');
					stream.write('</Style>\n');
					
	
					stream.write('<Point>\n'	);
					stream.write('<altitudeMode>relativeToGround</altitudeMode>\n');
					stream.write(`<coordinates>${latitude},${longitude},${azimuth}</coordinates>\n`);
					stream.write('</Point>\n');
					
					//stream.write('<LookAt>\n');
					//stream.write(`<longitude>${latitude}</longitude>\n`);
					//stream.write(`<latitude>${latitude}</latitude>\n`);
					//stream.write('</LookAt>\n');
					
					stream.write('<Polygon>\n');
					stream.write('<tessellate>1</tessellate>\n');
					stream.write('<altitudeMode>relativeToGround</altitudeMode>\n');
					stream.write('<outerBoundaryIs>\n');
					stream.write('<LinearRing>\n');	
					stream.write('<coordinates>\n');	
					stream.write(`${polygonCoords}\n`);	
					stream.write('</coordinates>\n');	
					stream.write('</LinearRing>\n');	
					stream.write('</outerBoundaryIs>\n');
					stream.write('</Polygon>\n');

					stream.write('</Placemark>\n');
					
					//Close Folder tag
					stream.write('</Folder>\n');
				}

				
				//generate kml based on data 
				//
				return;
			}
			

			
			const folder = folders[0];
			
			//remove first item
			let folderCopy = [...folders];
			folderCopy.splice(0,1);
			const remainingFolders = folderCopy;
			
			//Open value folder
			if(folder.valueType === 'Value'){
				stream.write('<Folder>\n');
				stream.write(`<name>${folder.value}</name>\n`);
				processFolders(remainingFolders, stream, {...filter});
				stream.write('</Folder>\n');
			}
			
			if(folder.valueType === 'Field'){
				const fieldName = folder.value;
				const uqfieldValues = getUniqueValuesForField(fieldName, filter);
				
				//iterate over unique field values 
				for(var j =0; j < uqfieldValues.length; j++){
					const uqVal = uqfieldValues[j];
					
					//Open value folder
					stream.write('<Folder>\n');
					stream.write(`<name>${uqVal}</name>\n`);
					
					processFolders(remainingFolders, stream, 
						{
							...filter, 
							[fieldName]: uqVal
					});
					
					stream.write('</Folder>\n');
					
				}
				
			}

			
			
	}
	
	var fs = require('fs');
	
	await new Promise((resolve, reject) => {
		var stream = fs.createWriteStream(fileName, {emitClose: true});
		stream.on('error', function (err) {
			log.err(err);
			reject()
			throw new Error("Error creating kml file.");
		});
		
		stream.on('finish', function () {
			resolve();
		});
		
		
		stream.once('open', function(fd) {
			stream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
			stream.write('<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n');
			stream.write('<Document>\n');
			stream.write('<name>Boda-Lite KML</name>\n');
			stream.write('<open>0</open>\n');
			stream.write('<description>Generated by Boda-Lite KML Generator Utility</description>\n');
			
			stream.write(`
			<ScreenOverlay>
			  <name>Legend: Boda-lite KML Utility</name>
			  <Icon>
				<href>YourURL.html</href>
			  </Icon>
			  <overlayXY x="0" y="0" xunits="fraction" yunits="fraction"/>
			  <screenXY x="25" y="95" xunits="pixels" yunits="pixels"/>
			  <rotationXY x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
			  <size x="0" y="0" xunits="pixels" yunits="pixels"/>
			</ScreenOverlay>`);
			
			processFolders(options.folders, stream, {});
			
			stream.write('</Document>\n');
		    stream.write('</kml>\n');
		  
		    stream.end();
		  //resolve();
		});

	})
	
	return fileName;
	
}

exports.generate = generate;
export const KML_SAVE_FILE_HEADERS = 'KML_SAVE_FILE_HEADERS';
export const KML_EXTRACTING_HEADERS= 'KML_EXTRACTING_HEADERS';
const XLSX = window.require('xlsx');

export function kmlExtractingHeaders(){
	return {
		type: KML_EXTRACTING_HEADERS
	}
}

export function kmlSaveFileHeaders(headers, dataFile){
	return{
		type: KML_SAVE_FILE_HEADERS,
		headers: headers,
		dataFile: dataFile
	}
}

/*
* @param string dataFile 
* @param string format EXCEL|CSV. Default is EXCEL
*/
export function kmlGetDataHeaders(dataFile, format){
    return async (dispatch, getState) => {
        dispatch(kmlExtractingHeaders());
		
		const fileFormat = format || "EXCEL";

		
		let headers = []
		
		if(fileFormat === 'EXCEL'){
			var workbook = XLSX.readFile(dataFile);
			
			var firstSheetName = workbook.SheetNames[0];
			var worksheet = workbook.Sheets[firstSheetName];
			var range = XLSX.utils.decode_range(worksheet['!ref']);
			
			const R = 0; //first row
			for(var C = range.s.c; C <= range.e.c; ++C) {
				var cellAddress = {c:C, r:R};

				/* if an A1-style address is needed, encode the address */
				var cellRef = XLSX.utils.encode_cell(cellAddress);
				var cell = worksheet[cellRef];
				headers.push(cell.v);
			}
		}
		
		dispatch(kmlSaveFileHeaders(headers, dataFile));
		
	}
	
}
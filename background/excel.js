const XLSX = window.require('xlsx');
const csv = window.require('csvtojson');
const Excel = window.require('exceljs');

/*
* Combine CSV files into Excel XLSB Workbook
*/
async function combineCSVToXLSB(inputFolder, outputFile){
	
	files = fs.readdirSync(inputFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

	var wb = XLSX.utils.book_new();
	
	for(let i=0; i< files.length; i++) {
		const fileName = files[i];
		const filePath = path.join(inputFolder, files[i]);
		const sheetName = fileName.replace(".csv", "");
		
		let wbData = [];
		await new Promise((resolve, reject) => {
			try{
				csv({noheader:true, output: "csv"})
				.fromFile(filePath)
				.subscribe( (csvRow)=>{
					wbData.push(csvRow);
				},(err) => {//onError
					log.error(`combineCSVtoXLSB.csvJoJson.onError: ${err.toString()}`);
					reject();
				},
				()=>{//onComplete
					resolve(undefined);
				}); 
			}catch(e){
				log.error(e);
			}
			
		});
		var ws = XLSX.utils.aoa_to_sheet(wbData);
		XLSX.utils.book_append_sheet(wb, ws, sheetName);		
	}

	//XLSX.writeFile(wb, outputFile, {Props:{Author:"Bodastage Solutions", bookType: "xlsb"}});
	XLSX.writeFile(wb, outputFile, {
		raw: true,
		bookType: "xlsb",
		type: "xlsb",
		compression: true,
		Props:{
			Author:"Boda-Lite"
		}
	});
}


/*
* Combine csv files in a folder
* 
* @param string csvFolder
*/
async function combineCSVToXLSX(csvFolder, combineExcelFile){
	files = fs.readdirSync(csvFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

	var excelOptions = {
	  filename: combineExcelFile
	};

	//const workbook = new Excel.Workbook();
	var workbook = new Excel.stream.xlsx.WorkbookWriter(excelOptions);
	
	workbook.creator = 'Boda-Lite';
	
	for(let i=0; i< files.length; i++) {
		const fileName = files[i];
		const filePath = path.join(csvFolder, files[i]);
		const sheetName = fileName.replace(".csv", "");
		
		const worksheet = workbook.addWorksheet(sheetName);

		await new Promise((resolve, reject) => {
			try{
				csv({noheader:true, output: "csv"})
				.fromFile(filePath)
				.subscribe( (csvRow)=>{
					worksheet.addRow(csvRow).commit();

				},(err) => {//onError
					log.error(`CSVToExcelCombiner.csvJoJson.onError: ${err.toString()}`);
					reject();
				},
				()=>{//onComplete
					resolve(undefined);
				}); 
			}catch(e){
				log.error(e);
			}
			
		});
		
		await worksheet.commit();
		
	}//eo-for
	
	await workbook.commit();
	
}

async function csvToXLSX(csvFolder, outputFolder){
	files = fs.readdirSync(csvFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	
	for(let i=0; i< files.length; i++) {
		const fileName = files[i];
		const filePath = path.join(csvFolder, files[i]);
		const sheetName = fileName.replace(".csv", "");
		
		const combineExcelFile = path.join(outputFolder, `${sheetName}.xlsx`);
		var excelOptions = {
		  filename: combineExcelFile
		};

		//const workbook = new Excel.Workbook();
		var workbook = new Excel.stream.xlsx.WorkbookWriter(excelOptions);
		
		workbook.creator = 'Boda-Lite';
		
		const worksheet = workbook.addWorksheet(sheetName);

		await new Promise((resolve, reject) => {
			try{
				csv({noheader:true, output: "csv"})
				.fromFile(filePath)
				.subscribe( (csvRow)=>{
					worksheet.addRow(csvRow).commit();

				},(err) => {//onError
					log.error(`CSVToExcelCombiner.csvJoJson.onError: ${err.toString()}`);
					reject();
				},
				()=>{//onComplete
					resolve(undefined);
				}); 
			}catch(e){
				log.error(e);
			}
			
		});
		
		await worksheet.commit();
		await workbook.commit();
		
	}//eo-for
	
}

/*
* Convert each CSV file into Excel XLSB Workbook
*/
async function csvToXLSB(inputFolder, outputFolder){
	
	files = fs.readdirSync(inputFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
	
	for(let i=0; i< files.length; i++) {
		const fileName = files[i];
		const filePath = path.join(inputFolder, files[i]);
		const sheetName = fileName.replace(".csv", "");
		const outputFile = path.join(outputFolder, sheetName + ".xlsb");
		
		var wb = XLSX.utils.book_new();
			
		let wbData = [];
		await new Promise((resolve, reject) => {
			try{
				csv({noheader:true, output: "csv"})
				.fromFile(filePath)
				.subscribe( (csvRow)=>{
					wbData.push(csvRow);
				},(err) => {//onError
					log.error(`combineCSVtoXLSB.csvJoJson.onError: ${err.toString()}`);
					reject();
				},
				()=>{//onComplete
					resolve(undefined);
				}); 
			}catch(e){
				log.error(e);
			}
			
		});
		var ws = XLSX.utils.aoa_to_sheet(wbData);
		XLSX.utils.book_append_sheet(wb, ws, sheetName);		
		XLSX.writeFile(wb, outputFile, {
			raw: true,
			bookType: "xlsb",
			type: "xlsb",
			compression: true,
			Props:{
				Author:"Boda-Lite"
			}
		});
	}


}


exports.csvToXLSX = csvToXLSX;
exports.csvToXLSB = csvToXLSB;
exports.combineCSVToXLSX = combineCSVToXLSX;
exports.combineCSVToXLSB = combineCSVToXLSB;
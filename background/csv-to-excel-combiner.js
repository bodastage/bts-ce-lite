const csv = window.require('csvtojson');
const Excel = window.require('exceljs');


/*
* Combine csv files in a folder
* 
* @param string csvFolder
*/
async function combine(csvFolder, combineExcelFile){
	files = fs.readdirSync(csvFolder,  { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

	var excelOptions = {
	  filename: combineExcelFile
	};

	//const workbook = new Excel.Workbook();
	var workbook = new Excel.stream.xlsx.WorkbookWriter(excelOptions);
	
	workbook.creator = 'Bodastage Solutions';
	
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
	//const res = await workbook.xlsx.writeFile(combineExcelFile);
	
}

exports.combine = combine;
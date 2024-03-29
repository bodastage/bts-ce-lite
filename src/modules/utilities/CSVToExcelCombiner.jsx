import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
	FileInput,
	Button ,
	Classes,
	ProgressBar,
	Intent,
	HTMLSelect
} from "@blueprintjs/core";
import  './utilities.css';

// const { ipcRenderer, shell} = window.require("electron")
//const fs = window.require('fs');
// const log = window.require('electron-log');

const COMBINE_OPTIONS = [
	"Combine into one Excel workbook",
	"Separate into different workbooks"
];

const EXCEL_FORMATS = ["XLSX", "XLSB"];

export default class CSVToExcelCombiner extends React.Component {
        
     static icon = "file-excel";
     static label = "CSV to Excel"

	constructor(props){
		super(props);
		
		this.state = {
			inputFolder: "Choose folder...",
			outputFolder: "Choose folder...",
			processing: false,
			notice: null,
			howToProcess: COMBINE_OPTIONS[0], //0-combined
			excelFormat: EXCEL_FORMATS[0],//0-xlsx
			combine: true,
		};
		
		this.combinerListener = null;
	}
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
	
	showFiles = (folder) => {
		// if (!fs.existsSync(folder)) {
		// 	this.setState({errorMessage: `${folder} does not exist`})
		// 	return;
		// }
		btslite_api.openPath(folder);
	}
	
	showOutputFolder = () => this.showFiles(this.state.outputFolder);
	
	showInputFolder = () => this.showFiles(this.state.inputFolder);
	
	onOutputFolderChange = (e) => {
		// if (!fs.existsSync(e.target.files[0].path)) {
		// 	this.setState({errorMessage: `${e.target.files[0].path} does not exist`})
		// 	return;
		// }
		
		this.setState({outputFolder: e.target.files[0].path})
	}
	
	/**
	* Update the input folder state when the text field value changes
	*/
	onInputFileChange = (e) => {
		// if (!fs.existsSync(e.target.files[0].path)) {
		// 	this.setState({errorMessage: `${e.target.files[0].path} does not exist`})
		// 	return;
		// }
		console.log('e.target.files[0].path:',e.target.files[0].path);
		this.setState({inputFolder: e.target.files[0].path})
	}

	handleChangeCombineMethod = (e) => {
		this.setState({
			howToProcess: e.target.value,
			combine: e.target.value === 'Combine into one Excel workbook' ? true : false
		});
	}
	
	handleFormatChange = (e) => this.setState({excelFormat: e.target.value});
	
	combineCSVFiles = async () => {
		
		let payload = {
			csvDirectory: this.state.inputFolder,
			combine: this.state.combine,
			excelFormat: this.state.excelFormat,
			outputFolder: this.state.outputFolder
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		// ipcRenderer.send('parse-cm-request', 'combine_csv_to_excel', JSON.stringify(payload));
		const result = await btslite_api.convertCsvToExcel(payload);
		console.log(result);

		this.setState({		
			processing: false,
			notice: {	
				type: result.status ,
				message: result.status === 'error' ? 'Error converting CSV files to Excel' : `CSV files converted to Excel successfully. ${result.data}`
			}
		});

		btslite_api.openPath(result.data);
		

	}
    render(){
		let inputFolderEllipsis = this.state.inputFolder === 'Choose folder...' ? "" : "file-text-dir-rtl";
		let outputFolderEllipsis = this.state.outputFolder === 'Choose folder...' ? "" : "file-text-dir-rtl";
		
		let notice = null;
		if(this.state.notice !== null ){ 
			notice = (<div className={`alert alert-${this.state.notice.type} p-2`} role="alert">{this.state.notice.message}
				<button type="button" className="btn-close right float-end" data-bs-dismiss="alert" aria-label="Close" onClick={this.dismissNotice}></button>
			</div>)
		}
		
        return (
            <div>

                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="file-excel"/> CSV to Excel</legend>
                    
					{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
                
                  <div className="card-body">
					<form>

					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Input folder</label>
						<div className="col-sm-8">
						  <FileInput 
						  	className={"form-control " + inputFolderEllipsis} 
							text={this.state.inputFolder} 
							//onInputChange={this.onInputFileChange} 
							inputProps={{webkitdirectory: "", mozdirectoryt:"", odirectory:"", directory:"", msdirectory:""}} 
							disabled={this.state.processing} 
							onClick={ async (e) => {
								e.preventDefault();
								const result = await btslite_api.openDirectory();
								console.log(result.filePaths[0]);
								this.setState({inputFolder: result.filePaths[0]});
							}}
							/>
						</div>
						<div className="col-sm-2">
							<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.showInputFolder()} disabled={this.state.processing}/>
						</div>
					  </div>
					  
					  {this.state.combine ? "" : (
						  <div className="form-group row">
							<label htmlFor="input_folder" className="col-sm-2 col-form-label">Output folder</label>
							<div className="col-sm-8">
							  <FileInput className={"form-control " + outputFolderEllipsis} text={this.state.outputFolder} onInputChange={this.onOutputFolderChange} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} disabled={this.state.processing}/>
							</div>
							<div className="col-sm-2">
								<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.showOutputFolder()} disabled={this.state.processing}/>
							</div>
						  </div>
					  )}
					  
					  
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Combine or Separate</label>
						<div className="col-sm-10">
						  <HTMLSelect options={COMBINE_OPTIONS} id="select_combine_method" value={this.state.howToProcess} onChange={this.handleChangeCombineMethod} disabled={this.state.processing} className="mr-2"/>
						</div>
					  </div>
					  
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Format</label>
						<div className="col-sm-10">
						  <HTMLSelect options={EXCEL_FORMATS} id="select_combine_method" value={this.state.excelFormat} onChange={this.handleFormatChange} disabled={this.state.processing} className="mr-2"/>
						</div>
					  </div>
					  
					</form>

                  </div>
				  
				  
				  <Button icon="play" text="Process" className={Classes.INTENT_PRIMARY}  onClick={this.combineCSVFiles} disabled={this.state.processing}/> &nbsp;
				  </fieldset>
            </div>    
        );
    }
}
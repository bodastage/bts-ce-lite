import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
	FileInput,
	Button ,
	Classes,
	ProgressBar,
	Intent,
	
} from "@blueprintjs/core";
import  './utilities.css';

const { app, shell } = window.require('electron').remote;
const { ipcRenderer} = window.require("electron")
const fs = window.require('fs');
const log = window.require('electron-log');

export default class CSVToExcelCombiner extends React.Component {
        
     static icon = "candy-cane";
     static label = "CSV to Excel Combiner"

	constructor(props){
		super(props);
		
		this.state = {
			inputFolder: "Choose folder...",
			processing: false,
			notice: null
		};
		
		this.combinerListener = null;
	}
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
	
	showFiles = () => {
		if (!fs.existsSync(this.state.inputFolder)) {
			this.setState({errorMessage: `${this.state.inputFolder} does not exist`})
			return;
		}
		shell.openItem(this.state.inputFolder)
	}
	
	/**
	* Update the input folder state when the text field value changes
	*/
	onInputFileChange = (e) => {
		this.setState({inputFolder: e.target.files[0].path})
	}
	
	combineCSVFiles = () => {
		//Confirm that the input folder exists
		if( !fs.existsSync(this.state.inputFolder)){
			log.info(`Input folder: ${this.state.inputFolder} does not exist`);
			this.setState(
				{
					notice: {
						type: 'danger', 
						message: `Input folder: ${this.state.inputFolder} does not exist`
					},
					processing: false
				}
			);
			return;
		}
		
		let payload = {
			csvDirectory: this.state.inputFolder
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'combine_csv_to_excel', JSON.stringify(payload));
		
		this.combinerListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'combine_csv_to_excel') return;
			
			//error
			if(obj.status === 'error' && task === 'combine_csv_to_excel' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.combinerListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'combine_csv_to_excel' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'combine_csv_to_excel' ){
				this.setState({
						notice: {
							type: 'success', 
						message: ` Combined file generated at: ${obj.message}`
							},
						processing: false
						});

				shell.showItemInFolder(obj.message);
				ipcRenderer.removeListener("parse-cm-request", this.combinerListener);
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.combinerListener);
		
		
	}
    render(){
		let inputFolderEllipsis = this.state.inputFolder === 'Choose folder...' ? "" : "file-text-dir-rtl";
		
		let notice = null;
		if(this.state.notice !== null ){ 
			notice = (<div className={`alert alert-${this.state.notice.type} p-2`} role="alert">{this.state.notice.message}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissNotice}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>)
		}
		
        return (
            <div>

                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="candy-cane"/> CSV to Excel Combiner</legend>
                    
					{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
                
                  <div className="card-body">
					<form>

					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Input folder</label>
						<div className="col-sm-8">
						  <FileInput className={"form-control " + inputFolderEllipsis} text={this.state.inputFolder} onInputChange={this.onInputFileChange} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} disabled={this.state.processing}/>
						</div>
						<div className="col-sm-2">
							<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.showFiles(this.state.inputFolder)} disabled={this.state.processing}/>
						</div>
					  </div>
					  
					</form>

                  </div>
				  
				  
				  <Button icon="play" text="Combine" className={Classes.INTENT_PRIMARY}  onClick={this.combineCSVFiles} disabled={this.state.processing}/> &nbsp;
				  </fieldset>
            </div>    
        );
    }
}
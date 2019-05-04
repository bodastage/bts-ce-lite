import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormGroup, InputGroup, Intent, Button, FileInput, HTMLSelect, ProgressBar, Classes   } from "@blueprintjs/core";
import { VENDOR_CM_FORMSTS, VENDOR_PARSERS } from './VendorCM.js'
//import Electron from 'electron';

const { remote } = window.require("electron")
const { app } = window.require('electron').remote;
const { spawn } = window.require('child_process') 
const path = window.require('path')

export default class ProcessCMDumps extends React.Component {
        
     static icon = "asterisk";
     static label = "Process CM Dumps"
	 
	constructor(props){
		super(props);
		
		this.state = {
			outputFolderText: "Choose output folder...",
			inputFileText: "Choose file...",
			vendors: ['ERICSSON', 'HUAWEI', 'ZTE', 'NOKIA'],
			currentVendor: 'ERICSSON',
			currentFormat: 'BULKCM',
			processing: false,
			errorMessage: null,
			successMessage: null
		}
		
		this.vendorFormats = VENDOR_CM_FORMSTS
		
		this.processDumps.bind(this)
		this.dismissErrorMessage.bind(this)
		this.dismissSuccessMessage.bind(this)
		
	}
	
	onOutputFolderInputChange = (e) => {
		this.setState({outputFolderText: e.target.files[0].path})
	}
	
	onInputFileChange = (e) => {
		this.setState({inputFileText: e.target.files[0].path})
	}
	
	onVendorFormatSelectChange =(e) => {
		this.setState({currentFormat: e.target.value })
	}

	onVendorSelectChange =(e) => {
		this.setState(
		{	currentVendor: e.target.value, 
			currentFormat: VENDOR_CM_FORMSTS[e.target.value][0]}
		)
	}
	
	processDumps = () => {
		console.log("Processing CM dumps...")
		
		const basepath = app.getAppPath();
		
		const parser = VENDOR_PARSERS[this.state.currentVendor][this.state.currentFormat]
		
		console.log(parser)
		const parser_path = path.join(basepath,'public','bin',parser)
		
		//const parser = ''
		const child = spawn('java', ['-jar', parser_path, '-i',this.state.inputFileText,'-o',this.state.outputFolderText]);
		
		child.stdout.on('data', (data) => {
		  console.log(data.toString());
		  //this.setState({errorMessage: data.toString()})
		});

		child.stderr.on('data', (data) => {
		  this.setState({errorMessage: data.toString()})
		});
		
		child.on('exit', code => {
			if(code === 0 ){
				this.setState({errorMessage: null, successMessage: `Dump successfully parsed. Find csv files in ${this.state.outputFolderText}`})
			}
		});
		
	}
	
	dismissErrorMessage = () => { this.setState({errorMessage: null})}
	dismissSuccessMessage = () => { this.setState({successMessage: null})}
	
    render(){
        return (
            <div>
                <h3><FontAwesomeIcon icon="asterisk"/> Process CM Dumps</h3>

                <div className="card mb-2">
				{ this.state.processing ? <ProgressBar intent={Intent.PRIMARY}/> : ""}
				
				{this.state.errorMessage !== null ? 
					<div className="alert alert-danger m-1 p-2" role="alert">
						{this.state.errorMessage}
						<button type="button" className="close"  aria-label="Close" onClick={this.dismissErrorMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div> 
					: ""}  
				{this.state.successMessage !== null ? 
					<div className="alert alert-success m-1 p-2" role="alert">
						{this.state.successMessage}
							<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div> 
				: ""}  
				
                  <div className="card-body">
                   
					<form>
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Vedndor</label>
						<div className="col-sm-10">
						  <HTMLSelect options={this.state.vendors} id="select_vendor" value={this.state.currentVendor} onChange={this.onVendorSelectChange}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="select_file_format" className="col-sm-2 col-form-label">Password</label>
						<div className="col-sm-10">
						  <HTMLSelect id="select_file_format"options={VENDOR_CM_FORMSTS[this.state.currentVendor]} value={this.state.currentFormat} onChange={this.onVendorFormatSelectChange}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Input folder</label>
						<div className="col-sm-10">
						  <FileInput className="form-control" text={this.state.inputFileText} onInputChange={this.onInputFileChange} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Output folder</label>
						<div className="col-sm-10">
						  <FileInput className="form-control" text={this.state.outputFolderText} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} onInputChange={this.onOutputFolderInputChange}/>
						</div>
					  </div>
					</form>
					
					
                  </div>
				  
                </div>
				
				<Button icon="play" text="Process" className={Classes.INTENT_PRIMARY}  onClick={this.processDumps}/> &nbsp;
				<Button icon="add" text="Add file/folder"  /> &nbsp;
            </div>    
        );
    }
}
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormGroup, InputGroup, Intent, Button, FileInput, HTMLSelect, ProgressBar, Classes   } from "@blueprintjs/core";
import { VENDOR_CM_FORMSTS, VENDOR_PARSERS } from './VendorCM.js'

const { remote } = window.require("electron")
const { app, process } = window.require('electron').remote;
const { spawn } = window.require('child_process') 
const path = window.require('path')
const isDev = window.require('electron-is-dev');
const replace = window.require('replace-in-file');

export default class ProcessCMDumps extends React.Component {
        
     static icon = "asterisk";
     static label = "Process CM Dumps"
	 
	constructor(props){
		super(props);
		
		this.state = {
			outputFolderText: "Choose folder...",
			inputFileText: "Choose folder...",
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
		this.areFormInputsValid.bind(this)
		
		//Move this logic to separate file 
		this.cleanHuaweiGexportFiles.bind(this)
		this.removeDublicateHuaweiGExportFiles.bind(this)
		
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
	
	/**
	* Validate the inputs from the form
	*/
	areFormInputsValid = () => {
		if(this.state.inputFileText === null || this.state.inputFileText === "Choose folder..."){
			this.setState({errorMessage: "Input folder is required"})
			return false
		}

		if(this.state.outputFolderText === null || this.state.outputFolderText === "Choose folder..."){
			this.setState({errorMessage: "Output folder is required"})
			return false
		}
		
		
		return true
	}
	
	
	//@TODO: This should be added to a separated file
	/**
	* Clean Huawei GExport files.
	*
	*	sed -i -r "
	*	s/_(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)//ig;
	*	s/_(BTS3900|PICOBTS3900|BTS3911B|PICOBTS3911B|MICROBTS3900|MICROBTS3911B)//ig;
	*	s/BSC(6910|6900)(UMTS|GSM)Function/FUNCTION/ig;
	*	s/BSC(6910|6900)Equipment/EQUIPMENT/ig;
	*	s/<class name=\"(.*)\"/<class name=\"\U\1\"/ig;
	*	s/<class name=\"(.*)_MSCSERVER/<class name=\"\1/ig;
	*	s/<class name=\"(.*)_ENODEB\"/<class name=\"\1\"/ig;
	*	s/<class name=\"(.*)3900/<class name=\"\1/ig;
	*	" /mediation/data/cm/huawei/raw/gexport/*.xml
	*
	* @exportFolder String Folder with the GExport dump XML files to be cleaned
	*/
	cleanHuaweiGexportFiles = (exportFolder) => {
		const replaceOptions = {
		  files: path.join(exportFolder,'*'),
		  from: [
			/_(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)/ig,
			/_(BTS3900|PICOBTS3900|BTS3911B|PICOBTS3911B|MICROBTS3900|MICROBTS3911B)/ig,
			/BSC(6910|6900)(UMTS|GSM)Function/ig,
			/BSC(6910|6900)Equipment/ig,
			/<class name=\"(.*)\"/ig,
			/<class name=\"(.*)_MSCSERVER/ig,
			/<class name=\"(.*)_ENODEB\"/ig,
			/<class name=\"(.*)3900/
		  ],
		  to: [
			"",
			"",
			"FUNCTION",
			"EQUIPMENT",
			(matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)\"/)[1].toUpperCase() + "\"",
			(matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)_MSCSERVER/)[1],
			(matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)_ENODEB\"/)[1] + "\"",
			(matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)3900/)[1]
		  ],
		};
		
		const results = replace.sync(replaceOptions);
		
	}
	
	/*
	* Take the latest file when there is more than one file from the same node .
	*
	8 @param pathToFolder The name of the folder containing the GExport XML CM dumps
	*/
	removeDublicateHuaweiGExportFiles = (pathToFolder) => {
		const fs = window.require('fs');
		
		//Key - value pair of node and the most recent file
		let nodeAndRecentFile = {}
		
		fs.readdir(pathToFolder, function(err, items) {
			
			for (var i=0; i<items.length; i++) {
				const gexportFilename = items[i];
				const matches = gexportFilename.match(/(.*)_(\d+)\.xml/)
				const node = matches[1]
				const timestamp = matches[2]
				
				if( typeof nodeAndRecentFile[node] === 'undefined'){
					nodeAndRecentFile[node] = gexportFilename
				}else{
					//Get timestamp on file in nodeAndRecentFile
					const mostRecentTimestamp = nodeAndRecentFile[node].match(/(.*)_(\d+)\.xml/)[2]
					
					if(parseInt(timestamp) > parseInt(mostRecentTimestamp)){
						
						//Delete the oldfile 
						fs.unlinkSync(path.join(pathToFolder, nodeAndRecentFile[node]))
						
						nodeAndRecentFile[node] = gexportFilename

					}
					
				}
			}
		});
		
	}
	
	processDumps = () => {
		
		//Validate inputs 
		if(!this.areFormInputsValid()) return
		
		const inputFolder = this.state.inputFileText
		
		//Clear error and success messages when processing starts
		this.setState({processing: true, errorMessage: null, successMessage: null})
		
		let basepath = app.getAppPath();

		
		if (!isDev) {
		  basepath = process.resourcesPath
		} 
		
		const parser = VENDOR_PARSERS[this.state.currentVendor][this.state.currentFormat]
		const parserPath = path.join(basepath,'libraries',parser)
		
		//Clean Huawei GExport files 
		if(this.state.currentVendor === 'HUAWEI' && this.state.currentFormat === 'GEXPORT_XML'){
			this.cleanHuaweiGexportFiles(inputFolder)
			
			this.removeDublicateHuaweiGExportFiles(inputFolder)
		}
		
		const child = spawn('java', ['-jar', parserPath, '-i',this.state.inputFileText,'-o',this.state.outputFolderText]);
		
		child.stdout.on('data', (data) => {
		  console.log(data.toString());
		  //this.setState({errorMessage: data.toString()})
		});

		child.stderr.on('data', (data) => {
		  this.setState({errorMessage: data.toString(), processing: false})
		});
		
		child.on('exit', code => {
			if(code === 0 ){
				this.setState({errorMessage: null, successMessage: `Dump successfully parsed. Find csv files in ${this.state.outputFolderText}`, processing: false})
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
				{ this.state.processing ? <ProgressBar intent={Intent.PRIMARY} className="mt-1"/> : ""}
				
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
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Vendor</label>
						<div className="col-sm-10">
						  <HTMLSelect options={this.state.vendors} id="select_vendor" value={this.state.currentVendor} onChange={this.onVendorSelectChange}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="select_file_format" className="col-sm-2 col-form-label">Format</label>
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
            </div>    
        );
    }
}
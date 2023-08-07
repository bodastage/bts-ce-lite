import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
	Intent, 
	Button, 
	FileInput, 
	HTMLSelect, 
	ProgressBar, 
	Classes, 
	Switch,
	Divider
	} from "@blueprintjs/core";
import { VENDOR_CM_FORMATS, VENDOR_PM_FORMATS, VENDOR_FM_FORMATS } from './VendorFormats.js'
import Timer from './Timer';
import { saveCMParsingFolders } from './cm-actions';

//styles
import  './process.css';

const { ipcRenderer} = window.require("electron")
const { shell } = window.require('electron');
//const fs = window.require('fs');
const log = window.require('electron-log');


/**
* Parse and import 
*
*/
class ParseAndImport extends React.Component {
        
     static icon = "asterisk";
     static label = "Process CM Dumps"
	 
	constructor(props){
		super(props);
		
		this.state = {
			inputFileText: this.props.inputFolder === null ? "Choose folder..." : this.props.inputFolder,
			outputFolderText: this.props.outputFolder === null ? "Choose folder..." : this.props.outputFolder,
			vendors: ['ERICSSON', 'HUAWEI', 'ZTE', 'NOKIA', 'MOTOROLA', 'BODASTAGE'],
			dataTypes: ['CM','PM', 'FM'],
			currentVendor: 'ERICSSON',
			currentDataType: 'CM',
			currentFormat: 'BULKCM',
			processing: false,
			errorMessage: null,
			successMessage: null,
			infoMessage: null,
			
			//Load parsed csv files into database
			loadIntoDB: false,
			
			//Clear tables before load
			clearTables: false
		}
		
		this.vendorFormats = VENDOR_CM_FORMATS
		
		this.processDumps = this.processDumps.bind(this)
		this.dismissErrorMessage = this.dismissErrorMessage.bind(this)
		this.dismissSuccessMessage = this.dismissSuccessMessage.bind(this)
		this.areFormInputsValid = this.areFormInputsValid.bind(this)
		this.handleLoadIntoDBChange = this.handleLoadIntoDBChange.bind(this);
		this.handlClearTablesChange = this.handlClearTablesChange.bind(this);
		this.clearForm = this.clearForm.bind(this)
		this.launchFolderExplorer = this.launchFolderExplorer.bind(this)
		this.onDataTypeSelectChange = this.onDataTypeSelectChange.bind(this)
		
		this.currentTimerValue = "00:00:00";
		
		
		this.processFilesListener = null;
		
	}
	
	/**
	* Update the output folder state when the text field value changes
	*/
	onOutputFolderInputChange = (e) => {
		if(typeof e.target.files !== 'object'){
			this.setState({errorMessage: 'Error reading file', successMessage: null, infoMessage:null, processing: false})
		}
		this.setState({outputFolderText: e.target.files[0].path})
	}
	
	/**
	* Update the input folder state when the text field value changes
	*/
	onInputFileChange = (e) => {
		if(typeof e.target.files !== 'object'){
			this.setState({errorMessage: 'Error reading file', successMessage: null, infoMessage:null, processing: false})
		}		
		
		this.setState({inputFileText: e.target.files[0].path})
	}
	
	/**
	* Update the vendor format in state when the vendor format is selected
	*/
	onVendorFormatSelectChange =(e) => {

		this.setState({currentFormat: e.target.value })
	}

	
	/**
	* Update the vendor in state when the vendor is selected
	*/
	onVendorSelectChange =(e) => {

		let currentFormat = null;
		if ( this.state.currentDataType === 'CM') { 
			if (Object.keys(VENDOR_CM_FORMATS).length > 0) currentFormat = VENDOR_CM_FORMATS[e.target.value][0];
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_CM_FORMATS;
		}
		
		if ( this.state.currentDataType === 'PM') {
			if (Object.keys(VENDOR_PM_FORMATS).length > 0) currentFormat = VENDOR_PM_FORMATS[e.target.value][0];
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_PM_FORMATS;
		}
		
		if ( this.state.currentDataType === 'FM'){ 
			if (Object.keys(VENDOR_FM_FORMATS).length > 0) currentFormat = currentFormat = VENDOR_FM_FORMATS[e.target.value][0];			
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_FM_FORMATS;
		}
		
		this.setState(
		{	currentVendor: e.target.value, 
			currentFormat: currentFormat
		})
	}
	
	/**
	* Update the data type in state when the domain select field is selected
	*/
	onDataTypeSelectChange =(e) => {
		
		const currentDataType = e.target.value;
		let currentFormat = null;
		if ( currentDataType === 'CM') { 
			if (Object.keys(VENDOR_CM_FORMATS).length > 0) currentFormat = VENDOR_CM_FORMATS[this.state.currentVendor][0];
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_CM_FORMATS;
		}
		
		if ( currentDataType === 'PM') {
			if (Object.keys(VENDOR_PM_FORMATS).length > 0) currentFormat = VENDOR_PM_FORMATS[this.state.currentVendor][0];
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_PM_FORMATS;
		}
		if ( currentDataType === 'FM'){ 
			if (Object.keys(VENDOR_FM_FORMATS).length > 0) currentFormat = currentFormat = VENDOR_FM_FORMATS[this.state.currentVendor][0];			
			else currentFormat = "";
			
			this.vendorFormats = VENDOR_FM_FORMATS;
		}
		
		this.setState(
		{	currentDataType: currentDataType, 
			currentFormat: currentFormat}
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
	
	
	handleLoadIntoDBChange = () => {
		this.setState({loadIntoDB: !this.state.loadIntoDB})
	}
	
	handlClearTablesChange = () => {
		this.setState({clearTables: !this.state.clearTables});
	}
	
	processDumps = () => {
		
		//Save the input and output folders 
		this.props.dispatch(saveCMParsingFolders(this.state.inputFileText, this.state.outputFolderText))
		
		//Confirm that the input folder exists
		// if( !fs.existsSync(this.state.inputFileText)){
		// 	log.info(`Input folder: ${this.state.inputFileText} does not exist`);
		// 	this.setState({errorMessage: `Input folder: ${this.state.inputFileText} does not exist`})
		// 	return;
		// }
		
		
		//Confirm that the output folder exists
		// if( !fs.existsSync(this.state.outputFolderText)){
		// 	log.info(`Output folder: ${this.state.outputFolderText} does not exist`);
		// 	this.setState({errorMessage: `Output folder: ${this.state.outputFolderText} does not exist`})
		// 	return;
		// }
		
		if(this.state.outputFolderText === this.state.inputFileText && 
			!(this.state.currentVendor === 'BODASTAGE' && this.state.currentDataType === 'PM' && this.state.currentFormat === 'CSV')
		){
			this.setState({errorMessage: `Input and output folders should be different.`})
			return;
		}
		
		this.setState({processing: true, errorMessage: null, successMessage: null})
		const payload = {
				"dataType": this.state.currentDataType,
				"vendor": this.state.currentVendor,
				"format": this.state.currentFormat,
				"inputFolder": this.state.inputFileText,
				"outputFolder": this.state.outputFolderText
			}

		ipcRenderer.send('parse-cm-request', 'parse_data', JSON.stringify(payload));
		log.info(`[process_cm_dumps] Sending IPC message on channel parsr-cm-request to main process with payload: ${payload}`)
		
		//Wait for response
		this.processFilesListener = (event, task, args) => {
			
			log.info(`Received message from IPC channel "parse-cm-request with message ${args}"`)	
			
			const obj = JSON.parse(args)
			
			if(obj.status === 'success' && task === 'parse_data' && !this.state.loadIntoDB){
				this.setState({errorMessage: null, successMessage: obj.message, infoMessage:null, processing: false})			
				ipcRenderer.removeListener("parse-cm-request", this.processFilesListener);
				this.processFilesListener = null;
			}
			
			if(obj.status === 'success' && task === 'parse_data' &&  this.state.loadIntoDB){
				this.setState({errorMessage: null, successMessage: null, infoMessage:obj.message, processing: true});	

				const loadPayload = {
					"dataType": this.state.currentDataType,
					"vendor": this.state.currentVendor,
					"format": this.state.currentFormat,
					"csvFolder": this.state.outputFolderText,
					"truncateTables": this.state.clearTables
				}
				ipcRenderer.send('parse-cm-request', 'load_data', JSON.stringify(loadPayload))				
			}
			
			if(obj.status === 'success' && task === 'load_data' && this.state.loadIntoDB){
				this.setState({errorMessage: null, successMessage: obj.message, infoMessage:null, processing: false});		
				ipcRenderer.removeListener("parse-cm-request", this.processFilesListener);
				this.processFilesListener = null;
			}
			
			
			
			if(obj.status === 'error' && (task === 'load_data' || task === 'parse_data') ){
				this.setState({errorMessage: obj.message.toString(), successMessage: null , infoMessage:null, processing: false});
				ipcRenderer.removeListener("parse-cm-request", this.processFilesListener);
				this.processFilesListener = null;
			}
			
			if(obj.status === 'info' && (task === 'load_data' || task === 'parse_data') ){
				this.setState({errorMessage: null, successMessage: null, infoMessage: obj.message})
				
			}

		}
		
		ipcRenderer.on('parse-cm-request', this.processFilesListener);
		return;
	}
	
	dismissErrorMessage = () => { this.setState({errorMessage: null})}
	
	dismissSuccessMessage = () => { this.setState({successMessage: null})}
	
	/**
	* Launch given folder path in file explorer
	*
	* @param string folderName
	*/	
	launchFolderExplorer = (folderName) => {
		
		// if (!fs.existsSync(folderName)) {
		// 	this.setState({errorMessage: `${folderName} does not exist`})
		// 	return;
		// }
		shell.openPath(folderName)
		
	}
	
	updateTimerValue = (hours, minutes, seconds) => { 
		let timerValue  = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		//this.props.dispatch(updateProcessCMTimer(timerValue));
		this.currentTimerValue = timerValue;
	} 
	
	clearForm = () => {
		this.setState({
			processing: false,
			outputFolderText: "Choose folder...",
			inputFileText: "Choose folder...",
		});
		//this.props.dispatch(updateProcessCMTimer("00:00:00"));
		this.currentTimerValue = "00:00:00"
		
	}
	
    render(){

		
		let successNotice = null;
		if(this.state.successMessage !== null ){ 
			successNotice = (<div className="alert alert-success m-1 p-2" role="alert">{this.state.successMessage}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>)
		}
		
		
		let errorNotice = null
		if(this.state.errorMessage !== null){
			errorNotice = (<div className="alert alert-danger m-1 p-2" role="alert">
						{this.state.errorMessage}
						<button type="button" className="close"  aria-label="Close" onClick={this.dismissErrorMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div>)
		}
		
		let infoNotice = null 
		if(this.state.infoMessage !== null){
			infoNotice = (<div className="alert alert-info m-1 p-2" role="alert">
				{this.state.infoMessage}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>) 
			
		}

		
		//Add ellipsi.. on the left if folder name is given 
		let inputFolderEllipsis = this.state.inputFileText === 'Choose folder...' ? "" : "file-text-dir-rtl";
		let outputFolderEllipsis = this.state.outputFolderText === 'Choose folder...' ? "" : "file-text-dir-rtl"
		
        return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="asterisk"/> Parse and Import</legend>
					
			
			<div>

				{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1"/>) : ""}
				{errorNotice}
				{successNotice}
				{infoNotice}
					
                  <div className="card-body">
                   
					<form>
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Data Type</label>
						<div className="col-sm-10">
						  <HTMLSelect options={this.state.dataTypes} id="select_data_type" value={this.state.currentDataType} onChange={this.onDataTypeSelectChange} disabled={this.state.processing} className="mr-2"/>
						</div>
					  </div>
					  
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Vendor/Format</label>
						<div className="col-sm-10">
						  <HTMLSelect options={this.state.vendors} id="select_vendor" value={this.state.currentVendor} onChange={this.onVendorSelectChange} disabled={this.state.processing} className="mr-2"/> &nbsp;
						  <HTMLSelect id="select_file_format"options={this.vendorFormats[this.state.currentVendor]} value={this.state.currentFormat} onChange={this.onVendorFormatSelectChange} disabled={this.state.processing}/>
						</div>
					  </div>

					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Input folder</label>
						<div className="col-sm-8">
						  <FileInput className={"form-control " + inputFolderEllipsis} text={this.state.inputFileText} onInputChange={this.onInputFileChange} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} disabled={this.state.processing}/>
						</div>
						<div className="col-sm-2">
							<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.launchFolderExplorer(this.state.inputFileText)} disabled={this.state.processing}/>
						</div>
					  </div>
					  
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Output folder</label>
						<div className="col-sm-8">
						  <FileInput className={"form-control " + outputFolderEllipsis} text={this.state.outputFolderText} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} onInputChange={this.onOutputFolderInputChange} disabled={this.state.processing}/>
						</div>
						<div className="col-sm-2">
							<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.launchFolderExplorer(this.state.outputFolderText)}/>
						</div>
					  </div>
					  
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label"></label>
						<div className="col-sm-8">
						  <Switch checked={this.state.loadIntoDB} label="Load into database" onChange={this.handleLoadIntoDBChange} disabled={this.state.processing}/> 
						  <Switch checked={this.state.clearTables} label="Clear previous data" onChange={this.handlClearTablesChange} disabled={this.state.processing}/>
						</div>
						<div className="col-sm-2">
							
						</div>
					  </div>
					  
					  
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label"></label>
						<div className="col-sm-10">
						<Timer className={"bp3-button"} visible={this.state.processing} onChange={this.updateTimerValue.bind(this)}/>  {this.state.processing? "" : <Button text={this.currentTimerValue}/>}
						</div>
					  </div>
					  
					</form>

                  </div>

                    <Button 
						icon="play" 
						text="Process" 
						className={Classes.INTENT_PRIMARY}  
						onClick={this.processDumps}
						disabled={this.state.processing}
					/>
					&nbsp;
					<Button text="Clear" onClick={this.clearForm} disabled={this.state.processing}/>
            </div>    
              </fieldset>
        );
    }
}

function mapStateToProps(state) {
  return {
    inputFolder: state.cm.parse_cm.inputFolder,
    outputFolder: state.cm.parse_cm.outputFolder,
	timerValue: state.cm.parse_cm.timerValue
  }
}

export default connect(mapStateToProps)(ParseAndImport);
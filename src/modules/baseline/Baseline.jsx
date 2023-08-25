import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Intent, Button, FileInput, HTMLSelect,
		 ProgressBar, Classes, Switch, Icon, FormGroup,
		 Collapse
		 } from "@blueprintjs/core";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 
import { runQuery, getSortAndFilteredQuery } from '../reports/DBQueryHelper.js';

//styles
import  './baseline.css';

// const { ipcRenderer, app, shell} = window.require("electron")

export default class Baseline extends React.Component {
    static icon = "pencil-ruler";
    static label = "Baseline Audit";
	
   constructor(props){
        super(props);
		
		this.onInputFileChange = this.onInputFileChange.bind(this)
		this.showBaselineFile = this.showBaselineFile.bind(this)
		this.uploadUserBaseline = this.uploadUserBaseline.bind(this)
		this.refreshData = this.refreshData.bind(this)
		
		this.clusteringOptions = ['NODE_AND_TAC'];
		this.scoringOptions = ['MAX_OCCURENCE'];
		
		this.agTblReload += 1;
		this.baselineListener = null;
		
		this.category = [];
		
		this.VENDOR_LIST = [
			"HUAWEI",
			"ERICSSON",
			"ZTE",
			"NOKIA"
		]
		
		this.TECH_LIST = ["2G", "3G", "4G", "5G"];
		this.MO_LIST = ["--All MOs--"];
		this.PARAM_LIST = ["--All Parameters--"];
		
		
        this.state = {
            columnDefs: [
				{headerName: "VENDOR", field: "vendor", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "TECH", field: "technology", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "MO", field: "mo", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "PARAMETER", field: "parameter", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "GRANURALITY", field: "granurality", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: "BASELINE", field: "baseline", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: " ", 
					field: "manage", 
					filter: "agTextColumnFilter", 
					filterParams:{caseSensitive: true},
					valueGetter: function(params){
						return  '4';
					},
					cellRendererFramework: (params) => {
						return <Icon icon="cross" onClick={() => this.deleteParameter(params.node.data.vendor, params.node.data.technology, params.node.data.mo, params.node.data.parameter)}/>;
					}
				}
			],
            rowData: [
            ],
            rowBuffer: 0,
            rowSelection: "multiple",
            rowModelType: "infinite",
            paginationPageSize: 50,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 2,
            infiniteInitialRowCount: 1,
            maxBlocksInCache: 2,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
            overlayNoRowsTemplate: "<span style=\"padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;\">This is a custom 'no rows' overlay</span>",
			
			//Default column definitions
			defaultColDef: {
				filter: true, // set filtering on for all cols
				sortable: true,
				resizable: true
			},
			
			
			processing: false,
			
			notice: null, //{type:info|success|error|warning, message: ...}
			
			clustering: 'NODE_AND_TAC',
			scoring: 'MAX_OCCURENCE',
			
			//Baseline configuration csv
			baselineFile: "",
			showConfigOptions: false,
			
			//baseline reference manual update 
			vendor: this.VENDOR_LIST[0],
			tech: this.TECH_LIST[0],
			mo: this.MO_LIST[0],
			baselineValue: "",
			
			reloadUI: 0
			
        };
		
		this.baselineRefDownloadListener = null;
		this.addToBaselineRefListener = null;
		this.deleteBaselineListener = null;
		this.clearBaselineRefListener = null;
		
	}
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
	
	onInputFileChange = (e) => {
		this.setState({baselineFile: e.target.files[0].path})
	}
	
	
    refreshData = () => {
        this.agTblReload += 1;
		this.gridApi.refreshInfiniteCache();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        let _columnApi =  params.columnApi;
        let _fields = this.state.columnDefs.map(v => v.field)
		let that = this;
		
		const query = `
		SELECT * FROM baseline.vw_configuration
		`;
		
        let dataSource = {  
            rowCount: null,
            getRows:  async function(params) {
                let offset = params.startRow;
                let length= params.endRow - params.startRow;

				if(_fields.length === 0) {
					params.successCallback([], 0); 
					return;
				}
				
				let filteredSortedQuery = getSortAndFilteredQuery(query,  _fields, 
						params.sortModel, params.filterModel, _columnApi.getAllColumns());
						
				//Updated the this.filteredSortedQuery	for download	
				that.filteredSortedQuery = filteredSortedQuery;
				
				//Count is the last row
				const _countQueryResult = await runQuery(`SELECT COUNT(1) as count FROM (${filteredSortedQuery}) t`);
				let count = _countQueryResult !== false ? _countQueryResult.rows[0].count : 0;

				const _qryResult =  await runQuery(`SELECT * FROM (${filteredSortedQuery}) t LIMIT ${length} offset ${offset}`);
				let queryResult = _qryResult !== false ? _qryResult : {rows: []};
				
				params.successCallback(queryResult.rows, count); 
			}
        };
        this.gridApi.setDatasource(dataSource);
    }
	
	setNotice = (type,message) => {this.setState({notice: {type: type, message: message}})}
	//Run baseline
	runBaseline = () => {
		let payload = {
			clustering: this.state.clustering,
			scoring: this.state.scoring 
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		// ipcRenderer.send('parse-cm-request', 'run_baseline', JSON.stringify(payload));
		btslite_api.baselineRun(payload);
		
		this.baselineListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'run_baseline') return;
			
			//error
			if(obj.status === 'error' && task === 'run_baseline' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				// ipcRenderer.removeListener("parse-cm-request", this.baselineListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'run_baseline' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'run_baseline' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				// ipcRenderer.removeListener("parse-cm-request", this.baselineListener);
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.baselineListener);
	}
	
	/**
	* Delete parameter's baseline reference 
	*/
	deleteParameter = (vendor, technology, mo, parameter) => {
		let payload = {
			vendor: vendor,
			technology: technology,
			mo: mo,
			parameter: parameter
		};
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'delete_baseline_parameter', JSON.stringify(payload));
		
		this.deleteBaselineListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'delete_baseline_parameter') return;
			
			//error
			if(obj.status === 'error' && task === 'delete_baseline_parameter' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				// ipcRenderer.removeListener("parse-cm-request", this.deleteBaselineListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'delete_baseline_parameter' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'delete_baseline_parameter' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				// ipcRenderer.removeListener("parse-cm-request", this.deleteBaselineListener);
				this.refreshData();
			}
			
		}
		// ipcRenderer.on('parse-cm-request', this.deleteBaselineListener);
		
	}
	
	/**
	* Clear all parameters in the baseline reference
	*/
	clearBaselineReference = () => {
		let payload = {
		};
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'clear_baseline_reference', JSON.stringify(payload));
		
		this.clearBaselineRefListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'clear_baseline_reference') return;
			
			//error
			if(obj.status === 'error' && task === 'clear_baseline_reference' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.clearBaselineRefListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'clear_baseline_reference' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'clear_baseline_reference' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				// ipcRenderer.removeListener("parse-cm-request", this.clearBaselineRefListener);
				this.refreshData();
			}
			
		}
		// ipcRenderer.on('parse-cm-request', this.clearBaselineRefListener);
		
	}
	
	
	/*
	* Update the cluster state variable
	*/
	onClusteringChange =(e) => {
		this.setState({cluster: e.target.value})
	}
	
	/*
	* Update the baseline scoring algorithm being used
	*/
	onScoringChange =(e) => {
		this.setState({scoring: e.target.value})
	}
	
	/*
	* Upload user baseline 
	*
	*/
	uploadUserBaseline = () => {
		
		//Show error notice if user tries to upload empty file.
		if(this.state.baselineFile.length === 0 ){
			this.setState({
				notice: {
					type: 'danger', 
					message: "No file selected!"
					}
			});
			return;
		}
		
		let payload = {
			baselineFile: this.state.baselineFile,
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		// ipcRenderer.send('parse-cm-request', 'upload_baseline', JSON.stringify(payload));
		btslite_api.baselineUpload(payload);
		
		this.uploadBaselineListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'upload_baseline') return;
			
			//error
			if(obj.status === 'error' && task === 'upload_baseline' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.uploadBaselineListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'upload_baseline' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'upload_baseline' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				ipcRenderer.removeListener("parse-cm-request", this.uploadBaselineListener);
				this.refreshData();
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.uploadBaselineListener);
	}
	
	
	/*
	* Download baseline reference
	*
	*/
	downloadBaselineReference = async () => {

		let payload = {
			"fileName": "baseline_reference",
			"format": "excel",
			"outputFolder": btslite_api.getPath('downloads')
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		//ipcRenderer.send('parse-cm-request', 'download_baseline_reference', JSON.stringify(payload));
		const result = await btslite_api.downloadBaseLineRef(payload);
		//btslite_api.shellShowItemInFolder(excelFile);

	}
	
	addToBaselineReference = () => {
		let payload = {
			"vendor": this.state.vendor,
			"tech": this.state.tech,
			"mo": this.state.mo,
			"parameter": this.state.parameter,
			"baseline": this.state.baselineValue
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'add_param_to_baseline', JSON.stringify(payload));
		
		this.addToBaselineRefListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'add_param_to_baseline') return;
			
			//error
			if(obj.status === 'error' && task === 'add_param_to_baseline' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.addToBaselineRefListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'add_param_to_baseline' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'add_param_to_baseline' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.addToBaselineRefListener);
				this.agTblReload += 1;
				this.gridApi.refreshInfiniteCache();
			}
			
		}

		ipcRenderer.on('parse-cm-request', this.addToBaselineRefListener);	
	}
	
	/**
	* Update hte MO_LIST used in the baseline reference update 
	* @param string vendor Vendor name  
	* @param string tech 
	*/
	updateMOList = async (vendor ,tech) => {
		const result = await runQuery(`SELECT DISTINCT mo FROM telecomlib.parameter_reference WHERE vendor = '${vendor}' AND technology = '${tech}'`);
		this.MO_LIST = [ '--All MOs--' ,...result.rows.map( v => v.mo)];
	}
	
	updateParameterList = async (vendor, tech, mo) => {
		const result = await runQuery(`SELECT DISTINCT parameter_id as parameter FROM telecomlib.parameter_reference WHERE vendor = '${vendor}' AND technology = '${tech}' AND mo = '${mo}'`);
		this.PARAM_LIST = [ '--All Parameters--' ,...result.rows.map( v => v.parameter)];	
		this.setState({parameter: this.PARAM_LIST[0]});
	}
	handleVendorSelect = async (event) => {
		const vendor = event.target.value;
		await this.updateMOList(vendor, this.state.tech);
		this.setState({vendor: vendor});
		await this.updateParameterList(this.state.vendor, this.state.tech, this.state.mo);
	}
	
	handleMOSelect = async (event) => {
		const mo = event.target.value;
		await this.updateParameterList(this.state.vendor, this.state.tech, mo);
		this.setState({mo: mo});
		
	}
	
	handleTechSelect = async (event) => {
		const tech = event.target.value;
		await this.updateMOList(this.state.vendor, tech);
		this.setState({tech: tech});
		await this.updateParameterList(this.state.vendor, this.state.tech, this.state.mo);
		
	}
	
	handleParameterSelect = (event) => {
		this.setState({parameter: event.target.value});
	}
	
	handleValueChange = (event) => {
		this.setState({baselineValue: event.target.value});
	}
	
	/*
	* Show selected baseline file
	*
	*/
	showBaselineFile(){
		if(this.state.baselineFile.length === 0 ){
			this.setState({
				notice: {
					type: 'danger', 
					message: "No file selected!"
					}
			});
			return;
		}
		btslite_api.shellShowItemInFolder(this.state.baselineFile);
	}
	
	handleConfigureChange = (e) => {
		this.setState({showConfigOptions: !this.state.showConfigOptions});
	}
	
	
    render(){   
		let inputFileEllipsis = "file-text-dir-rtl";
	
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
                    <legend className="legend"><FontAwesomeIcon icon="pencil-ruler"/> Baseline Audit</legend>
					
					{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
												
					<div className="">     

						<form>
						  <Button icon="play" onClick={this.runBaseline}  text="Run baseline audit" className={Classes.INTENT_PRIMARY} disabled={this.state.processing}/> &nbsp;
						</form>
					</div>
					
					<hr />
					<div><Switch  disabled={this.state.processing} checked={this.state.showConfigOptions} label="Custom configuration" onChange={this.handleConfigureChange}/></div>
					<Collapse isOpen={this.state.showConfigOptions}>
					
					<h5>List of parameters for baseline audit</h5>
					
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Upload baseline</label>
						<div className="col-sm-6">
						  <FileInput 
							className={"form-control " + inputFileEllipsis} 
							text={this.state.baselineFile} 
							onInputChange={this.onInputFileChange}  
							/>
						</div>
						<div className="col-sm-4">
							<Button icon="folder-open" text="" minimal={true} onClick={this.showBaselineFile} className="mr-2"/>
							<Button icon="cloud-upload" text="Upload" className={Classes.INTENT_PRIMARY} onClick={this.uploadUserBaseline} disabled={this.state.processing}/> &nbsp;
						</div>
					
					  </div>
	
					<div>
						<FormGroup>
								<Button icon="refresh" onClick={this.refreshData} minimal={true}></Button>
								<Button icon="download" onClick={this.downloadBaselineReference} minimal={true}></Button>
								<Button icon="trash" onClick={this.clearBaselineReference} minimal={true} />
								&nbsp;| &nbsp;
								
								<HTMLSelect options={this.VENDOR_LIST} className="mr-2" onChange={this.handleVendorSelect} name="vendor"/>
								<HTMLSelect options={this.TECH_LIST} className="mr-2" onChange={this.handleTechSelect} name="tech"/>
								<HTMLSelect options={this.MO_LIST} className="mr-2" onChange={this.handleMOSelect} name="mo"/>
								<HTMLSelect options={this.PARAM_LIST} className="mr-2" onChange={this.handleParameterSelect} name="parameter"/>
								<input className="bp3-input" placeholder="Baseline value" name="baseline_value" defaultValue={this.state.baselineValue} onChange={this.handleValueChange}/>
								 &nbsp;
								<Button icon="add" onClick={this.addToBaselineReference} minimal={true}></Button>
						</FormGroup>
					</div>
					<div className="ag-theme-balham" style={{width: '100%', height: "100%", boxSizing: "border-box"}}>
						<AgGridReact
							key={"create-table-key-" + this.agTblReload}
							pagination={true}
							domLayout="autoHeight"
							defaultColDef={this.state.defaultColDef}
							columnDefs={this.state.columnDefs}
							rowBuffer={this.state.rowBuffer}
							rowSelection={this.state.rowSelection}
							rowDeselection={true}
							rowModelType={this.state.rowModelType}
							paginationPageSize={this.state.paginationPageSize}
							cacheOverflowSize={this.state.cacheOverflowSize}
							maxConcurrentDatasourceRequests={this.state.maxConcurrentDatasourceRequests}
							infiniteInitialRowCount={this.state.infiniteInitialRowCount}
							maxBlocksInCache={this.state.maxBlocksInCache}
							onGridReady={this.onGridReady.bind(this)}
							>
						</AgGridReact>

					</div>
					
					</Collapse>

					
				</fieldset>
			</div>
		)
	}
}
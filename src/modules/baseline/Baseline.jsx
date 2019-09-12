import React from 'react';
import { Provider } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { Intent, Button, FileInput, HTMLSelect, Position,
		 ProgressBar, Classes, Switch, Icon, Tooltip  } from "@blueprintjs/core";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 
import { runQuery, getSortAndFilteredQuery } from '../reports/DBQueryHelper.js';


//styles
import  './baseline.css';

const { app, shell } = window.require('electron').remote;
const { ipcRenderer} = window.require("electron")

export default class Baseline extends React.Component {
    static icon = "pencil-ruler";
    static label = "Baseline Audit";
	
   constructor(props){
        super(props);
        this.state = {
            columnDefs: [
				{headerName: "VENDOR", field: "vendor", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "TECH", field: "technology", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "MO", field: "mo", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "PARAMETER", field: "parameter", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "GRANULITY", field: "granulity", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: "BASELINE", field: "baseline", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: " ", field: "manage", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}
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
			baselineFile: ""
        };
		
		this.onInputFileChange = this.onInputFileChange.bind(this)
		this.showBaselineFile = this.showBaselineFile.bind(this)
		this.uploadUserBaseline = this.uploadUserBaseline.bind(this)
		this.refreshData = this.refreshData.bind(this)
		
		this.clusteringOptions = ['NODE_AND_TAC'];
		this.scoringOptions = ['MAX_OCCURENCE'];
		
		this.agTblReload += 1;
		this.baselineListener = null;
		
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
				let count = ( await runQuery(`SELECT COUNT(1) as count FROM (${filteredSortedQuery}) t`) ).rows[0].count
				let queryResult = await runQuery(`SELECT * FROM (${filteredSortedQuery}) t LIMIT ${length} offset ${offset}`);
				
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
		
		ipcRenderer.send('parse-cm-request', 'run_baseline', JSON.stringify(payload));
		
		this.baselineListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'run_baseline') return;
			
			//error
			if(obj.status === 'error' && task === 'run_baseline' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.baselineListener);
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

				ipcRenderer.removeListener("parse-cm-request", this.baselineListener);
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.baselineListener);
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
		this.setState({processing: true});
		
		let payload = {
			baselineFile: this.state.baselineFile,
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'upload_baseline', JSON.stringify(payload));
		
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
		shell.showItemInFolder(this.state.baselineFile);
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
		
		let outputFolderEllipsis = "file-text-dir-rtl"
		
        return (

            <div>
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="pencil-ruler"/> Baseline Audit</legend>
					
					{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
					
<h5>Compute baseline</h5>										
					<div className="">     

						<form>
						  
						  
						  <div className="form-group row">
							<label htmlFor="input_folder" className="col-sm-2 col-form-label">Clustering</label>
							<div className="col-sm-8">
							  <HTMLSelect options={this.clusteringOptions} id="clustering_algo" 
							  className="mr-2" 
							  onChange={this.onClusteringChange.bind(this)}	
							  value={this.state.clustering}/> 
							  
								<Tooltip content="Algorithm for clustering cells for baseline computation" position={Position.RIGHT}>
								<Icon icon="info-sign" />
								</Tooltip>
							</div>
							<div className="col-sm-2">
								
							</div>
						  </div>
						  
						  
						  <div className="form-group row">
							<label htmlFor="input_folder" className="col-sm-2 col-form-label">Score</label>
							<div className="col-sm-8">
							  <HTMLSelect options={this.scoringOptions} id="scoring_algo" className="mr-2"
								onChange={this.onScoringChange.bind(this)}							  
								value={this.state.scoring}/> 
							  
								<Tooltip content="Algorithm for determining the baseline value" position={Position.RIGHT}>
								<Icon icon="info-sign" />
								</Tooltip>
							</div>
							<div className="col-sm-2">
								
							</div>
						  </div>
						  <Button icon="play" onClick={this.runBaseline}  text="Run baseline" className={Classes.INTENT_PRIMARY} disabled={this.state.processing}/> &nbsp;
						</form>
					</div>
					
					<hr />
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
					
					
					<div className="mb-2">
						<Button icon="refresh" onClick={this.refreshData} minimal={true}></Button>
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

					
				</fieldset>
			</div>
		)
	}
}
import React from 'react';
import { Provider } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { Intent, Button, FileInput, HTMLSelect, 
		 ProgressBar, Classes, Switch   } from "@blueprintjs/core";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 
import { runQuery, getSortAndFilteredQuery } from '../reports/DBQueryHelper.js';
import  './telecomlib.css';

const { app, shell } = window.require('electron').remote;
const { ipcRenderer} = window.require("electron")

export default class ParameterLibrary extends React.Component {
    static icon = "book";
    static label = "Parametr Reference";
	
    constructor(props){
        super(props);
        this.state = {
            columnDefs: [
				{headerName: "VENDOR", field: "vendor", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "TECHNOLOGY", field: "technology", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "MANAGED OBJECT", field: "mo", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "PARAMETER ID", field: "parameter_id", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "PARAMETER NAME", field: "parameter_name", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}}, 
				{headerName: "IS KEY", field: "is_key", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: "GRANULITY", field: "granulity", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
				{headerName: "DESCRIPTION", field: "descripton", filter: "agTextColumnFilter", filterParams:{caseSensitive: true}},
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
            
			//
			referenceFile: "",
			
			notice: null, //{type:info|success|error|warning, message: ...}
			
			processing: false,
			
			clearTableBefore: false
        };
		
		this.agTblReload += 1;
		
		this.onInputFileChange = this.onInputFileChange.bind(this)
		this.showReferenceFile = this.showReferenceFile.bind(this)
		this.uploadParameterReference = this.uploadParameterReference.bind(this)
		this.autoGenerateParamRef = this.autoGenerateParamRef.bind(this)
		this.handlClearTablesChange = this.handlClearTablesChange.bind(this)
		this.refreshData = this.refreshData.bind(this)
		
		//ipcRenderer listener
		this.uploadParameterRefListener = null;
		this.autoGenerateParamRefListener = null;
		
		this.gridApi = null;
	}
	
	showReferenceFile = () => {
		if(this.state.referenceFile.length === 0 ){
			this.setState({
				notice: {
					type: 'danger', 
					message: "No file selected!"
					}
			});
			return;
		}
		shell.showItemInFolder(this.state.referenceFile);
	}
	
	
	handlClearTablesChange = () => {
		this.setState({clearTableBefore: !this.state.clearTableBefore});
		
	}
	
	onInputFileChange = (e) => {
		this.setState({referenceFile: e.target.files[0].path})
	}
	
    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        let _columnApi =  params.columnApi;
        let _fields = this.state.columnDefs.map(v => v.field)
		let that = this;
		
		const query = `
		SELECT * FROM telecomlib.parameter_reference
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
	
	/*
	* Upload parameter reference 
	*
	*/
	uploadParameterReference = () => {
		
		//Show error notice if user tries to upload empty file.
		if(this.state.referenceFile.length === 0 ){
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
			referenceFile: this.state.referenceFile,
			clearTableBefore: false
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'upload_parameter_reference', JSON.stringify(payload));
		
		this.uploadParameterRefListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'upload_parameter_reference') return;
			
			//error
			if(obj.status === 'error' && task === 'upload_parameter_reference' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.uploadParameterRefListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'upload_parameter_reference' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'upload_parameter_reference' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				ipcRenderer.removeListener("parse-cm-request", this.uploadParameterRefListener);
				this.refreshData();
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.uploadParameterRefListener);
	}
	
	

	/*
	* Auto generate parameter reference
	*
	*/
	autoGenerateParamRef = () => {
		
		this.setState({processing: true});
		
		let payload = {
			clearTableBefore: this.state.clearTableBefore
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'auto_generate_param_ref', JSON.stringify(payload));
		
		this.autoGenerateParamRefListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'auto_generate_param_ref') return;
			
			//error
			if(obj.status === 'error' && task === 'auto_generate_param_ref' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.autoGenerateParamRefListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'auto_generate_param_ref' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'auto_generate_param_ref' ){
				this.setState({
						notice: {
							type: 'success', 
							message: obj.message
							},
						processing: false
						});

				ipcRenderer.removeListener("parse-cm-request", this.autoGenerateParamRefListener);
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.autoGenerateParamRefListener);
	}
	
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
	
    refreshData = () => {
        this.agTblReload += 1;
		this.gridApi.refreshInfiniteCache();
    }
	
    render(){   
		let outputFolderEllipsis = "file-text-dir-rtl"
	
	
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
                    <legend className="legend"><FontAwesomeIcon icon="book"/> Parameter Reference</legend>
					
					{ this.state.processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
					
					<form>
					

					  
					  
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Update reference</label>
						<div className="col-sm-6">
						  <FileInput className={"form-control " + outputFolderEllipsis} 
						  text="Reference file" 
						  onInputChange={this.onInputFileChange}  
						  text={this.state.referenceFile} 
						  disabled={this.state.processing}
						  />
						</div>
						<div className="col-sm-4">
							<Button icon="folder-open" text="" minimal={true} onClick={this.showReferenceFile} />
						  
						</div>
					
					  </div>
					  
					  <div className="form-group row">
						<div className="col-sm-8">
							<Switch checked={this.state.clearTableBefore} label="Clear old reference before loading" onChange={this.handlClearTablesChange} disabled={this.state.processing}/>
						
							<Button icon="cloud-upload" text="Upload" 
								className={Classes.INTENT_PRIMARY} 
								onClick={this.uploadParameterReference}
								disabled={this.state.processing}
								/> &nbsp;
							<Button icon="automatic-updates" text="Auto generate" className={Classes.INTENT_PRIMARY} 
							onClick={this.autoGenerateParamRef}
							disabled={this.state.processing}
							/> &nbsp;
						
						</div>
						<div className="col-sm-2">
							
						</div>
					  </div>
					  					  
					</form>

					  
					<hr />
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
		);
	}
}
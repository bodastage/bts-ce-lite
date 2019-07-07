import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReportFields,
          deleteReport, clearReportCreateState,
         getReportInfo, } from './reports-actions';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 

import axios from '../../api/config';
import { ProgressBar, Intent, ButtonGroup, Button, Classes, Toaster, Alert,
		 Dialog, Popover, Spinner, Callout } from "@blueprintjs/core"; 
import classNames from 'classnames';
import { addTab, closeTab } from '../layout/uilayout-actions';
import { SQLITE3_DB_PATH } from "../session/db-settings";
import { runQuery, getSQLiteReportInfo, getSortAndFilteredQuery } from './DBQueryHelper.js';

const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client } = window.require('pg');
const { remote, ipcRenderer} = window.require("electron")
const { app, shell } = window.require('electron').remote;
const path = window.require('path')

//Maximum number of times to check if the file is being generated 
//for download
const MAX_STATUS_CHECKS = 3;

class TableReport extends React.Component{
    static icon = "table";
    static label = "";
    constructor(props){
        super(props);
        
        this.columnDefs = []
        
        this.toaster = new Toaster();
        
        this.downloadInterval = null;
        this.progressToastInterval = null;
        this.progressToastKey = null;
        this.progressToastCount = 0;
         
        this.onDownloadClick = this.onDownloadClick.bind(this);
        this.handleProgressToast = this.handleProgressToast.bind(this);


        this.handleErrorOpen = this.handleErrorOpen.bind(this);
        this.handleErrorClose = this.handleErrorClose.bind(this);
        this.refreshData = this.refreshData.bind(this);
        this.clearDownloadProgress = this.clearDownloadProgress.bind(this)
        this.handleAlertClose = this.handleAlertClose.bind(this)
        
		this.handleDialogOpen = this.handleDialogOpen.bind(this)
		this.handleDialogClose = this.handleDialogClose.bind(this)
		this.dismissNotice = this.dismissNotice.bind(this)
		this.setNotice = this.setNotice.bind(this)
		
        this.state = {
            columnDefs: [],
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

            //Download Alert state
            canEscapeKeyCancel: false,
            canOutsideClickCancel: false,
            isOpen: false,
            isOpenError: false,
            isAlertOpen: false,
			
			//Report detials dialog 
			isDialogOpen: false,
			
			//Processing
			processing: false,
			
			popoverIsOpen: false,
			
			notice: null, //{type:info|success|error|warning, message: ...}
			
			
            
            
        };
        
        //This is filled when a download is triggered
        this.downloadUrl = "";
        this.downloadFilename="";
		this.downloadReportListener = null;
        
        this.agTblReload = 1; //used to reload the aggrid table
    }
    
    refreshData = () => {
        this.props.dispatch(getReportFields(this.props.options.reportId));
        
        this.toaster.show({
                icon: "info-sign",
                intent: Intent.INFO,
                message: "Refreshing report...",
        });
        
        this.agTblReload += 1;
    }
    
    handleErrorOpen = () => this.setState({ isOpenError: true });
    
    handleErrorClose = () => { 
        this.setState({ isOpenError: false,  });
    } 
    
    /**
     * Hides the download details alert. 
     * 
     * It is called when the download alert is closed
     * 
     * @returns {undefined}
     */
    handleAlertClose = () => {
       this.setState({isAlertOpen: false}) 
    }
    
    /**
     * Dismiss the download progress toast
     * 
     * @returns {undefined}
     */
    clearDownloadProgress(){
        clearTimeout(this.downloadInterval);
        clearInterval(this.progressToastInterval);

        this.downloadUrl = null;
        this.downloadFilename = null;
        
        this.progressToastCount = 101;
        //this.toaster.dismiss();
 
    }
    
 
    
    componentDidMount() {
		console.log('Mounting TableReport...');
        if(this.props.fields.length === 0 ){
            this.props.dispatch(getReportFields(this.props.options.reportId));
        }
        
    }
    
	setNotice = (type,message) => {this.setState({notice: {type: type, message: message}})}
    /**
     * Trigger the download 
     * 
     * @returns {undefined}
     */
    onDownloadClick(){

        this.toaster.show({
                icon: "download",
                intent: Intent.INFO,
                message: "Downloading report...",
        });
		
		this.setState({processing: true});
		let payload = {
			reportId: this.props.options.reportId,
			outputFolder: app.getPath('downloads')
		}
		
		ipcRenderer.send('parse-cm-request', 'download_report', JSON.stringify(payload));
		
		this.downloadReportListener = (event, task, args) => {

			const obj = JSON.parse(args)
			
			if(task !== 'download_report') return;
			
			if(obj.status === 'error' && task === 'download_report' ){
				this.setState({
						notice: {type: 'error', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.downloadReportListener);
				this.downloadReportListener = null;
			}
			
			if(obj.status === 'info' && task === 'download_report' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'download_report' ){
				let reportFile = path.join(app.getPath('downloads'),'');
				this.setState({
						notice: {
							type: 'success', 
							message: `File generated at ${obj.message}`
							},
						processing: false
						});
				shell.showItemInFolder(obj.message);
				ipcRenderer.removeListener("parse-cm-request", this.downloadReportListener);
				this.downloadReportListener = null;
			}
		}
		
		ipcRenderer.on('parse-cm-request', this.downloadReportListener);
    }
    
    /*
     * launch download progress toast
     */
    renderDownloadProgress(amount) {
        return {
//            className: this.props.data.themeName,
            icon: "cloud-download",
            message: (<div>
                <span>Downloading...</span>
                <ProgressBar
                    className={classNames("docs-toast-progress", { [Classes.PROGRESS_NO_STRIPES]: amount >= 100 })}
                    intent={amount < 100 ? Intent.PRIMARY : Intent.SUCCESS}
                    value={amount / 100}
                    /></div>
            ),
            timeout: amount < 100 ? 0 : 2000,
        };
    }
    
    /**
     * Set up and start download progress toast
     * 
     * @returns {undefined}
     */
    handleProgressToast = () => {
        this.progressToastCount = 0;
        this.progressToastKey = this.toaster.show(this.renderDownloadProgress(0));
        this.progressToastInterval = setInterval(() => {
            if(this.props.download !== null ){ 
                if(this.props.download.status.toUpperCase() === 'FINISHED' ||
                   this.props.download.status.toUpperCase() === 'FAILED'
                    ){
                    clearInterval(this.progressToastInterval);
                    return;
                }
            }
            
            if (this.toaster === null || this.progressToastCount > 100) {
                clearInterval(this.progressToastInterval);
            } else {
                //Don't reach 100
                if(this.progressToastCount + 20 < 100) { 
                    this.progressToastCount += Math.random() * 20;
                    this.toaster.show(this.renderDownloadProgress(this.progressToastCount), this.progressToastKey);
                }
                
            }
        }, 1000);
    }

    
    /**
     * Update the column definitions for the aggrid table
     * 
     * @returns {undefined}
     */
    updateColumnDefs(){
        this.columnDef = [];
        if( typeof this.props.fields === 'undefined'  ) return;
        
        for(var key in this.props.fields){
            let columnName = this.props.fields[key]
            this.columnDef.push({
				headerName: columnName, 
				field: columnName,  
                filter: "agTextColumnFilter",
				filterParams:{caseSensitive: true}
			});
        }
    }

    /**
     * 
     * 
     * @param {type} params
     * @returns {undefined}
     */
     onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        let _columnApi =  params.columnApi;
        let token = this.props.token;
        let _fields = this.props.fields;
        let _dispatch = this.props.dispatch;
        let reportId = this.props.options.reportId;
		
		if(typeof this.props.reportInfo === 'undefined') return;
		
		let query = this.props.reportInfo.query ;

        let dataSource = {  
            rowCount: null,
            getRows:  async function(params) {
                let offset = params.startRow;
                let length= params.endRow - params.startRow;
				console.log("_fields.length:" + _fields.length );
				if(_fields.length === 0) {
					params.successCallback([], 0); 
					return;
				}
				
				let filteredSortedQuery = getSortAndFilteredQuery(query,  _fields, 
						params.sortModel, params.filterModel, _columnApi.getAllColumns());
				
				//Count is the last row
				let count = ( await runQuery(`SELECT COUNT(1) as count FROM (${filteredSortedQuery}) t`) ).rows[0].count
				console.log("count:", count);
				let queryResult = await runQuery(`SELECT * FROM (${filteredSortedQuery}) t LIMIT ${length} offset ${offset}`);
				
				params.successCallback(queryResult.rows, count); 
				
            }
        };
        this.gridApi.setDatasource(dataSource);
    }
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
    
    /**
     * Create toask reference
     */
    refHandlers = {
        toaster: (ref) => (this.toaster = ref),
    };
    
    handleDialogOpen = () => this.setState({ isDialogOpen: true });
    handleDialogClose = () => this.setState({ isDialogOpen: false });
	
    render(){
        this.updateColumnDefs();
        
        //Download alert
        const { isOpen, isOpenError, ...alertProps } = this.state;

		let notice = null;
		if(this.state.notice !== null ){ 
			notice = (<div className={`alert alert-${this.state.notice.type} m-1 p-2`} role="alert">{this.state.notice.message}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissNotice}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>)
		}
		
        //Show spinner as we wait for fields
        if( this.props.fields.length === 0 && this.props.requestError === null ){
            return <Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
        }
		
		//If there is an error and the fields are zero, then there may be an issue with the query
        if( this.props.fields.length === 0 && this.props.requestError !== null ){
            return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon={TableReport.icon}/> {this.props.options.title}</legend>
                    <Callout intent={Intent.DANGER}> {this.props.requestError}</Callout>
				</fieldset>		
				);
        }
		
        return (
            <div>
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon={TableReport.icon}/> {this.props.options.title}</legend>
					
						{notice}
						
						{this.state.processing === false? "" : <ProgressBar intent={Intent.PRIMARY}/>}
						
                        <div className="mb-1">
                        <ButtonGroup minimal={true}>
                            <Button icon="refresh" onClick={this.refreshData}></Button>
                            <Button icon="download"  onClick={this.onDownloadClick}></Button>
                            <Toaster {...this.state} ref={this.refHandlers.toaster} />
                            <Button icon="info-sign" onClick={this.handleDialogOpen}></Button>
                        </ButtonGroup>

                        </div>
                        <div className="ag-theme-balham" style={{width: '100%', height: "100%", boxSizing: "border-box"}}>
                            <AgGridReact
                                key={"create-table-key-" + this.agTblReload}
                                pagination={true}
								domLayout="autoHeight"
                                columnDefs={this.columnDef}
                                enableColResize={true}
                                rowBuffer={this.state.rowBuffer}
                                rowSelection={this.state.rowSelection}
                                rowDeselection={true}
                                rowModelType={this.state.rowModelType}
                                paginationPageSize={this.state.paginationPageSize}
                                cacheOverflowSize={this.state.cacheOverflowSize}
                                maxConcurrentDatasourceRequests={this.state.maxConcurrentDatasourceRequests}
                                infiniteInitialRowCount={this.state.infiniteInitialRowCount}
                                maxBlocksInCache={this.state.maxBlocksInCache}
                                enableServerSideSorting={true}
                                enableServerSideFilter={true}
                                onGridReady={this.onGridReady.bind(this)}
                                >
                            </AgGridReact>

                        </div>


                <Alert
                    {...alertProps}
                    confirmButtonText="Okay"
                    isOpen={this.state.isAlertOpen}
                    onClose={this.handleAlertClose}>
                    <p>
                        Download file: <a target='_blank' href={'//'+window.location.hostname + ':8181' + this.downloadUrl} download>{this.downloadFilename}</a> <br />
                        Or pick it from the reports folder.
                    </p>
                </Alert>

				{ typeof this.props.reportInfo === 'undefined' ? "" :
				<Dialog
				isOpen={this.state.isDialogOpen}
				onClose={this.handleDialogClose}
				title={this.props.reportInfo.name}
				>
					<div className={Classes.DIALOG_BODY}>
						<pre>
						{this.props.reportInfo.query}
						</pre>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={this.handleDialogClose}>Close</Button>
						</div>
					</div>
				</Dialog>
				}
                </fieldset>	
            </div>
        );
    }
}

function mapStateToProps(state, ownProps){
    
    if ( typeof state.reports.reportsdata[ownProps.options.reportId] === 'undefined'){
        return {
            requesting: false,
            requestError:  null,
            token: state.session.userDetails.token,
            fields: [],
            download: null
        };
    }
    
    return {
            requesting: state.reports.reportsdata[ownProps.options.reportId].requesting,
            requestError:  state.reports.reportsdata[ownProps.options.reportId].requestError,
            token: state.session.userDetails.token,
            fields: state.reports.reportsdata[ownProps.options.reportId].fields,
            download: state.reports.reportsdata[ownProps.options.reportId].download
    };
}

export default connect(mapStateToProps)(TableReport);
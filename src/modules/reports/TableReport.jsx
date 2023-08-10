import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReportFields, getReportInfo } from './reports-actions';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css'; 
import { ProgressBar, Intent, ButtonGroup, Button, Classes, Toaster,
		 Dialog, Popover, Spinner, Callout, 
		 Menu, MenuItem, Position, HTMLSelect } from "@blueprintjs/core"; 
import classNames from 'classnames';
import { runQuery, getSortAndFilteredQuery } from './DBQueryHelper.js';
import { generateStyleClass, getTableStyleExpression } from './reports-utils';
		 
// const { ipcRenderer, shell , app} = window.require("electron")

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


        this.handleErrorOpen = this.handleErrorOpen.bind(this);
        this.handleErrorClose = this.handleErrorClose.bind(this);
        this.refreshData = this.refreshData.bind(this);
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
			
			//Default column definitions
			defaultColDef: {
				filter: true, // set filtering on for all cols
				sortable: true,
				resizable: true,
				headerComponentParams : {
				template:
					'<div class="ag-cell-label-container" role="presentation">' +
					'  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
					'  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
					'    <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>' +
					'    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>' +
					'    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>' +
					'    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>' +
					'    <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
					'    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
					'  </div>' +
					'</div>'
				}
			},
			
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
		
		//Filtered query to be used by download
		this.filteredSortedQuery = null;
		
		//Options for the number of rows to select on the aggrid
		this.numDisplayRowsOptions = [
			'10',
			'25',
			'50',
			'100',
			'200'
		];
    }
    
    refreshData = () => {
        this.props.dispatch(getReportFields(this.props.options.reportId));
		this.props.dispatch(getReportInfo(this.props.options.reportId));
        
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
	 * @param string format csv|excel
     * @returns {undefined}
     */
    onDownloadClick = (format) => (e) => {
		e.preventDefault();
		
        this.toaster.show({
                icon: "download",
                intent: Intent.INFO,
                message: "Downloading report...",
        });
		
		this.setState({processing: true});
		
		let fileName = this.props.reportInfo.name.replace(/\s+/g,"_");
		
		//Sanitize download file name
		fileName = fileName.replace(/['"+]/g,"");
		
		//Preserve column order in export 
		const columnOrder = this.gridColumnApi.getColumnState().filter(v  => v.hide === false ).map( v => v.colId)
		let downloadQuery = `SELECT "${columnOrder.join('","')}" FROM ( ${this.filteredSortedQuery} ) dq`

		let payload = {
			reportId: this.props.options.reportId,
			query: downloadQuery,
			filename: fileName, //Name of the file to be downloaded  without extension
			// outputFolder: app.getPath('downloads'), 
			outputFolder: btslite_api.getPath('downloads'), 
			format: format,
		}
		
		//ipcRenderer.send('parse-cm-request', 'download_report', JSON.stringify(payload));
		const downloadStatus = btslite_api.reportsDownload(payload);
		
		this.downloadReportListener = (event, task, args) => {

			const obj = JSON.parse(args)
			
			if(task !== 'download_report') return;
			
			if(obj.status === 'error' && task === 'download_report' ){
				this.setState({
						notice: {type: 'error', message: obj.message},
						processing: false
						});
				//ipcRenderer.removeListener("parse-cm-request", this.downloadReportListener);
			}
			
			if(obj.status === 'info' && task === 'download_report' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'download_report' ){
				this.setState({
						notice: {
							type: 'success', 
							message: `File generated at ${obj.message}`
							},
						processing: false
						});
				btslite_api.shellShowItemInFolder(obj.message);
				//ipcRenderer.removeListener("parse-cm-request", this.downloadReportListener);
			}
		}
		
		//ipcRenderer.on('parse-cm-request', this.downloadReportListener);
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
	* 
	*/
	selectNumRowsToDisplay = (event) => {
       this.setState({paginationPageSize: event.currentTarget.value});
	   this.agTblReload = this.agTblReload + 1;
	}
    
    /**
     * Update the column definitions for the aggrid table
     * 
     * @returns {undefined}
     */
    updateColumnDefs(){
        this.columnDef = [];
        if( typeof this.props.fields === 'undefined'  ) return;
        
		const tableStyles = this.props.reportInfo.options.tableStyles;
		const reportId = this.props.reportInfo.id;
		
        for(var key in this.props.fields){
            let columnName = this.props.fields[key]

			
			//Cell Styles 
			let cellClassRules = {};

			if(tableStyles !== undefined){
				if(typeof tableStyles[columnName] !== 'undefined'){
					const conditions = tableStyles[columnName].conditions;
					
					for(var idx in conditions){
						const cond = conditions[idx];
						
						if(typeof cond.styleConditions === 'undefined') continue;
						
						const className = generateStyleClass(reportId, columnName, idx);
						const condExpr = getTableStyleExpression(cond.styleConditions);
						
						cellClassRules[className] = condExpr
					}
					
				}
			}

			
            this.columnDef.push({
				headerName: columnName, 
				field: columnName,  
                filter: "agTextColumnFilter",
				filterParams:{caseSensitive: true},
				cellClassRules: cellClassRules
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
        let _fields = this.props.fields;
		let that = this;
		
		if(typeof this.props.reportInfo === 'undefined') return;
				
		let query = this.props.reportInfo.query ;

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
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
    
    /**
     * Create toast reference
     */
    refHandlers = {
        toaster: (ref) => (this.toaster = ref),
    };
    
    handleDialogOpen = () => this.setState({ isDialogOpen: true });
    handleDialogClose = () => this.setState({ isDialogOpen: false });
	
    render(){
        this.updateColumnDefs();

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
            return (<div>
                    <Callout intent={Intent.DANGER}> {this.props.requestError}</Callout>
					<Toaster {...this.state} ref={this.refHandlers.toaster} />
					</div>
				);
        }
		
		//Download file types 
		const downloadFileTypesMenu = (<Menu>
				<MenuItem icon={<span><FontAwesomeIcon icon="file-csv"/></span>} text="CSV" onClick={this.onDownloadClick('csv')}/>
				<MenuItem icon={<span><FontAwesomeIcon icon="file-excel"/></span>} text="EXCEL" onClick={this.onDownloadClick('excel')}/>
			</Menu>);
		
		//Create table styles 
		let tableStylesCSS = "";
		if(typeof this.props.reportInfo.options !== 'undefined'){
			const tableStyles = this.props.reportInfo.options.tableStyles;
			const reportId = this.props.reportInfo.id;
								
			for(var field in tableStyles){
				const conditions = tableStyles[field].conditions;
				for(var i in conditions){
					const cond = conditions[i];
					const propt = cond.property;
					const propVal = cond.propertyValue;
					
					const className = generateStyleClass(reportId, field, i);
					
					tableStylesCSS += `
					.${className} \{ ${propt}: ${propVal};\}
					`;
				}
					
			}

		}
		
        return (
            <div>
			
				<style dangerouslySetInnerHTML={{__html: `
					 .test-test{}
 					 ${tableStylesCSS}
					`}} />
			
			
						{notice}
						
						{this.state.processing === false? "" : <ProgressBar intent={Intent.PRIMARY}/>}
						
                        <div className="mb-1">
                        <ButtonGroup minimal={true}>
                            <Button icon="refresh" onClick={this.refreshData}></Button>
							<Popover content={downloadFileTypesMenu} position={Position.BOTTOM}>
								<Button icon="download"></Button>
							</Popover>
                            <Toaster {...this.state} ref={this.refHandlers.toaster} />
                            <Button icon="info-sign" onClick={this.handleDialogOpen}></Button>
							
							
                        </ButtonGroup>
						
						<HTMLSelect options={this.numDisplayRowsOptions} onChange={this.selectNumRowsToDisplay.bind(this)} value={this.state.paginationPageSize} className="float-right"></HTMLSelect>

                        </div>
                        <div className="ag-theme-balham" style={{width: '100%', height: "100%", boxSizing: "border-box"}}>
                            <AgGridReact
                                key={"create-table-key-" + this.agTblReload}
                                pagination={true}
								domLayout="autoHeight"
								defaultColDef={this.state.defaultColDef}
                                columnDefs={this.columnDef}
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

				{ typeof this.props.reportInfo === 'undefined' ? "" :
				<Dialog
				isOpen={this.state.isDialogOpen}
				onClose={this.handleDialogClose}
				title={this.props.reportInfo.name}
				icon="info-sign"
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
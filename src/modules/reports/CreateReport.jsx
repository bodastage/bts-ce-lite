import React from 'react';
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';
import { connect } from 'react-redux';
import 'brace/mode/sql';
import 'brace/theme/github';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ResizeSensor, FormGroup, InputGroup, Button, TextArea, Intent, Spinner,
         Callout, Menu, MenuItem, ProgressBar, HTMLSelect , Popover, Position } from "@blueprintjs/core";
import { Select, ItemListRenderer } from "@blueprintjs/select";
import { AgGridReact } from 'ag-grid-react';
import axios from '../../api/config';
import { requestCreateReportFields, clearPreviewReportError,
         createReportPreviewError, clearReportCreateState, 
         createOrUpdateReport, getReport, getReportInfo } from './reports-actions';
import Plot from 'react-plotly.js';
import './create-report-styles.css'
import { GraphOptionsContainer } from './GraphOptions'
import { runQuery, getSQLiteReportInfo, getSortAndFilteredQuery } from './DBQueryHelper.js';


class CreateReport extends React.Component{
    static icon = "table";
    static label = "Create Report";
    
    constructor(props){
        super(props);
        
        this.handleResize = this.handleResize.bind(this)
        this.loadPreview = this.loadPreview.bind(this)
        
        this.state = {
            notesValuve: "",
            loadPreview: false,
            columns: [],
            
            //AgGrid properties
            columnDefs: [],
            rowData: [
            ],
            rowBuffer: 0,
            rowSelection: "multiple",
            rowModelType: "infinite",
            paginationPageSize: 100,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 2,
            infiniteInitialRowCount: 1,
            maxBlocksInCache: 2,
            
            //Download Alert state
            canEscapeKeyCancel: false,
            canOutsideClickCancel: false,
            isOpen: false,
            isOpenError: false,
            
            //
            reportType: 'Table',
            category: this.props.categories[0],
            plotWidth: null,
            
            //@TODO: Looking in replacing ploltly's revision property
            plotReloadCount: 0
            
        }
        
        
        this.handleNotesChange = this.handleNotesChange.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.onGridReady = this.onGridReady.bind(this)
        this.onAceChange = this.onAceChange.bind(this)
        this.updateColumnDefs = this.updateColumnDefs.bind(this)
        this.updateReportType = this.updateReportType.bind(this)
        
        //Default ace code editor text
        this.aceEditorValue = "Write report query here";
        
        //Default report name 
        this.reportName = "New Report";
        this.reportNotes = "Some notes on the report";
        this.previewError = null;
        this.agTblReload = 1; //used to reload the aggrid table
        
        //Preview table 
        this.columnDef = []
        
        //Category Select
        this.categoryItemRenderer = this.categoryItemRenderer.bind(this)
        this.handleCategoryValueChange = this.handleCategoryValueChange.bind(this)
        this.handleModelUpdated = this.handleModelUpdated.bind(this)
                
        this.saveReport = this.saveReport.bind(this)
        
        this.fetchingReportInfo = false;
        
        //This is an edit instance
        if( typeof this.props.options.reportId !== 'undefined' ){
            const reportId = this.props.options.reportId;
//            this.props.dispatch(getReport(reportId));
            this.fetchingReportInfo = true;
        }
        
        this.nameRedraw = 0;
        
        //Report types 
        this.reportTypes = ["Table","Graph"];
        this.addPlotTrace = this.addPlotTrace.bind(this);
        this.getGraphOptions = this.getGraphOptions.bind(this);
        this.updatePlotData = this.updatePlotData.bind(this);
        
        //Plotly data parameter values
        this.plotData = [];
        
        //Plolty layout options
        this.plotLayout = { 
            width: null, 
            height: null, 
            title: {
                text: this.reportName
            },
            //X-Axis settings
            xaxis: {
                title: { text: null} 
            },
            //Y-Axis
            yaxis:{
                title: { text: null}
            }
            
        };
        
        
        
        //Preview data
        //Holds the aggrid data
        this.previewData = [];
        
        
        //This is used to indicate that the report type has changed as result 
        //of selecting the type selection combo
        this.reportTypeChange = false;
    }
 
    handleResize(resizeEntries){
        this.setState({plotWidth: resizeEntries[0].contentRect.width + "px"})
    }
         
    componentWillMount(){
        
    }
    
    componentDidMount(){
        if( typeof this.props.options.reportId !== 'undefined' ){
            if(this.props.reportInfo === null){
                this.fetchingReportInfo = true;
                this.props.dispatch(getReportInfo(this.props.options.reportId))
            }
        }
    }
    
    componentWillUnmount(){
        //this.props.dispatch(clearReportCreateState());
        this.props.dispatch(clearPreviewReportError());
    }
    
    handleCategoryValueChange(category) { 
        this.setState({ category: category});
    }
        
    saveReport(){
        //this.setState({loadPreview: false});
        
        let options = {"type": this.state.reportType}
        if(this.state.reportType === 'Graph'){
            options = {
                type: this.state.reportType,
                data: this.getGraphOptions(),
                layout: this.plotLayout //Plotly layout options
            }
        }
        
        this.props.dispatch(createOrUpdateReport({
            name: this.reportName,
            category_id: this.state.category.id,
            notes: this.reportNotes,
            qry: this.aceEditorValue,
            reportId: this.props.reportInfo !== null ? this.props.reportInfo.id : null,
            options: options
        }));
    }
    
    /**
     * 
     *@TODO: Request list from server 
     * 
     * @param {type} items
     * @param {type} itemsParentRef
     * @param {type} query
     * @param {type} renderItem
     * @returns {itemsParentRef@var;renderedItems|String|Boolean}
     */
   
    renderCategoryList(items, itemsParentRef, query, renderItem){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
    
    categoryItemListRenderer({items, itemsParentRef, query, renderItem}){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
    categoryItemPredicate(query, category){
        return category.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    }
    categoryItemRenderer( category, {handleClick, modifiers} ){
        if (!modifiers.matchesPredicate) {
                return null;
            }
            return (
                <MenuItem
                    active={modifiers.active}
                    key={category.id}
                    label=""
                    onClick={handleClick}
                    text={category.name}
                />
            );
    }

    /*
     * Show data preview for the query in a table
     * 
     */
    loadPreview(){
        this.setState({loadPreview: true, plotReloadCount: this.state.plotReloadCount+1})
        
        this.props.dispatch(requestCreateReportFields(this.reportName, this.aceEditorValue, {}));
        this.props.dispatch(clearPreviewReportError());
        
        //this is incremented to reload/redraw the aggrid
        this.agTblReload += 1;
        
        
    }
    /**
     * Handle change of value of Ace editor 
     * 
     * @param {type} newValue
     * @returns
     */
    onAceChange(newValue){
        this.aceEditorValue = newValue;
    }
    
    handleNotesChange(event){
        this.reportNotes = event.target.value;
    }
    
    handleNameChange(event){
        this.reportName = event.target.value;
    }
    
    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        let _columnApi =  params.columnApi;
        let token = this.props.token;
        let _fields = this.props.fields;
        let _dispatch = this.props.dispatch;
        let reportId = this.props.options.reportId;
        let that = this;
        
		const reportName = this.reportName;
		const query = this.aceEditorValue;
        
        let dataSource = {  
            rowCount: null,
            getRows: async function(params) {
                let offset = params.startRow;
                let length= params.endRow - params.startRow;
                
				if(_fields.length === 0) {
					params.successCallback([], 0); 
					return;
				}
				
				let filteredSortedQuery = getSortAndFilteredQuery(query,  _fields, 
						params.sortModel, params.filterModel, _columnApi.getAllColumns());
				
				//Count is the last row
				let count = ( await runQuery(`SELECT COUNT(1) as count FROM (${filteredSortedQuery}) t`) ).rows[0].count
				
				let queryResult = await runQuery(`SELECT * FROM (${filteredSortedQuery}) t LIMIT ${length} offset ${offset}`);
				
				params.successCallback(queryResult.rows, count); 
				
            }
        };
        this.gridApi.setDatasource(dataSource);
        
//        this.gridApi.onFistDataRendered(){
//            
//        }
    }
    
    
        updateColumnDefs(){
        this.columnDef = [];
        if( typeof this.props.fields === 'undefined'  ) return;
        for(var key in this.props.fields){
            let columnName = this.props.fields[key]
            this.columnDef.push(
                {headerName: columnName, field: columnName,  
                 filter: "agTextColumnFilter"},);
        }
    }
    
    
    /**
     * Add plot trace to preview graph 
     * 
     * @param string type bar|pie|scatter
     * @returns
     */
    addPlotTrace(type){
        
        if(type === 'bar'){
            //Use the first field as the x and y data source on addtion of bar chart
            let xField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            let yField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            
            let xData  = this.previewData.map((entry, idx) => entry[xField]);
            let yData  = this.previewData.map((entry, idx) => entry[yField]);
            
            let barData = {type: 'bar', x: xData, y: yData, name: yField, xField: xField, yField: yField};
            this.plotData.push(barData);
            this.setState({plotReloadCount: this.state.plotReloadCount+1});
        }
        
        if(type === 'pie'){
            //Use first field as the labels and values source on addition of a pie chart
            let labelsField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            let valuesField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            
            let labelsData = this.previewData.map((entry, idx) => entry[labelsField]);
            let valuesData = this.previewData.map((entry, idx) => entry[valuesField]);
            
            let data = {type: 'pie', values: labelsData, labels: valuesData, labelsField: labelsField, valuesField:valuesField};
            this.plotData.push(data);
            this.setState({plotReloadCount: this.state.plotReloadCount+1});
        }
        
        if(type === 'scatter'){
            
            //Use the first field as the x and y data source on addtion of scatter plot
            let xField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            let yField = this.props.fields.length > 0 ? this.props.fields[0] : null;
            
            let xData  = this.previewData.map((entry, idx) => entry[xField]);
            let yData  = this.previewData.map((entry, idx) => entry[yField]);
            
            let data = {
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: 'red'},
            };
            this.plotData.push(data);
            this.setState({plotReloadCount: this.state.plotReloadCount+1});
        }   
    }
    
    removeValuesFromPlotData = () => {}
    
    /**
     * Return graph otpions without the data
     * 
     * @returns {Array}
     */
    getGraphOptions(){
        let gOptions = []
        this.plotData.forEach((plt, idx) => {
            if(plt.type === 'pie'){
                plt.values = []
                plt.labels = []
            }
            if(plt.type === 'bar' || plt.type === 'scatter'){
                plt.x = []
                plt.y = []
            }
            
            gOptions.push(plt)
        });
        return gOptions;
    }
    
   
   //Update the preview Data when the aggrid model is updated
   handleModelUpdated(){
       this.previewData = [];
       
       //Handle cases where the grid has not yet been initialized
       if( this.gridApi === undefined ) return;
       
       this.gridApi.forEachNode( (rowNode, index) => {
            this.previewData.push(rowNode.data);
        });
        
       //Update graph
       this.setState({plotReloadCount: this.state.plotReloadCount+1});
   }
   
   selectReportType = (event) => {
       this.reportTypeChange = true;
       this.setState({reportType: event.currentTarget.value});
   }

    
    //Updates the plotPreviewData When the graph options are updated
    updatePlotData(newOptions){
        
        //Remove empty slots
        newOptions = newOptions.filter((v) => v!==undefined )
        
        for(let i in newOptions){
            
            if( newOptions[i].type === 'bar'){
                let xField = newOptions[i].xField;
                let yField = newOptions[i].yField;
                newOptions[i].x = this.previewData.map((entry, idx) => entry[xField]);
                newOptions[i].y = this.previewData.map((entry, idx) => entry[yField]);
                newOptions[i].name = yField;
            }

            if( newOptions[i].type === 'scatter'){
                let xField = newOptions[i].xField;
                let yField = newOptions[i].yField;
                newOptions[i].x = this.previewData.map((entry, idx) => entry[xField]);
                newOptions[i].y = this.previewData.map((entry, idx) => entry[yField]);
                newOptions[i].name = yField;
            }
            
            if( newOptions[i].type === 'pie'){
                let labelsField = newOptions[i].labelsField;
                let valuesField = newOptions[i].valuesField;
                newOptions[i].labels = this.previewData.map((entry, idx) => entry[labelsField]);
                newOptions[i].values = this.previewData.map((entry, idx) => entry[valuesField]);
                //newOptions[i].xaxis = {showgrid: false, zeroline: false, showline: false, showticklabels: false, ticks:''}
                //newOptions[i].yaxis = {showgrid: false, zeroline: false, showline: false, showticklabels: false, ticks:''}
            }
        }
        
        this.plotData = newOptions;
        this.setState({plotReloadCount: this.state.plotReloadCount+1});
    }
    
    updateGraphOptions(newOptions){
       this.updatePlotData(newOptions);
       this.setState({plotReloadCount: this.state.plotReloadCount+1});
   }
   
   /**
    * Set the report type. 
    * 
    * This is meant to be used to trigger a state update during report editting
    * Reference: https://plot.ly/javascript/reference/#layout
    * 
    * @param {type} reportType
    * @returns {undefined}
    */
   updateReportType = (reportType) => {
       this.setState({reportType: reportType})
   }
           
    /**
     * Update graph layout options.
     * 
     * This includes the title, axes, etc..
     * 
     * @param object plotlyLayout Options
     * 
     * @returns {undefined}
     */       
    updateLayoutOptions = (newLayoutOptions) => {
        console.log(`updateLayoutOptions(${newLayoutOptions})`)
        console.log(newLayoutOptions)
        
        this.plotLayout = newLayoutOptions
        this.setState({plotReloadCount: this.state.plotReloadCount+1});
    }
    
    
    render(){
        const { spinnerSize, spinnerHasValue, spinnerIntent, spinnerValue, columns, loadPreview, category } = this.state;
        const tabTitle = this.props.options.title;
        
        let defaultName = this.reportName;
        let defaultNotes = this.reportNotes;
        let activeItem   = this.state.category;
        
        if(this.fetchingReportInfo === true && this.props.reportInfo !== null){ 
            
            this.aceEditorValue = this.props.reportInfo.query;
            this.reportName = this.props.reportInfo.name;

            //This is changed to force re-rendering of the inputGroup and textarea
            this.nameRedraw +=  1;
            
            defaultName =  this.props.reportInfo.name;
            defaultNotes = this.props.reportInfo.notes;
            activeItem = {id: this.props.reportInfo.category_id, name: 'Category'}
            
            //Set the default category in the select search
            for(let c in this.props.categories){
                const cat = this.props.categories[c];
                if(cat.id === this.props.reportInfo.category_id){
                    activeItem = cat;
                    break;
                }
            }

            //@TODO: Move this out of render. render() should not have side effects
            //For now, it remains here so that we can move forward
            this.setState({category: activeItem });
            
            //This ensures the defualt are not reset back on every re-render
            this.fetchingReportInfo = false;
        }
        
        //fetchingReportInfo is set to true because the request to get the report 
        //details some times delays
        if( typeof this.props.options.reportId !== 'undefined' ){
            if(this.props.reportInfo === null){
                this.fetchingReportInfo = true;
            }
        }
        
        //console.log("this.props:", this.props)
        
        //Update preview area
        let previewTable;
        if( this.props.previewError !== null && loadPreview === true ){
            previewTable=<Callout icon="error" intent={Intent.DANGER} title="Error with preview">{this.props.previewError}</Callout>;
        }else if(this.props.fields.length === 0 && loadPreview === true){
            previewTable = <Spinner intent={spinnerIntent} size={spinnerSize}/>
        }else if(this.props.fields.length === 0 && loadPreview === false){
            previewTable = <span>Preview report here...</span>
        }else{
                this.updateColumnDefs();
                previewTable = <div className="ag-theme-balham" 
                                    style={{width: '100%', height: "100%", boxSizing: "border-box"}}
                                    key={"create-table-key-" + this.agTblReload}
                                >
                            <AgGridReact
                                pagination={true}
                                gridAutoHeight={true}
                                columnDefs={this.columnDef}
                                components={this.state.components}
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
                                onModelUpdated={this.handleModelUpdated.bind(this)}
                                >
                            </AgGridReact>
                        </div>
        }
        
        //Plot types menu
        const plotTypesMenu = (
        <Menu>
            <MenuItem icon="timeline-bar-chart" text="Bar" onClick={(ev) => {ev.preventDefault(); this.addPlotTrace('bar');}}/>        
            <MenuItem icon="pie-chart" text="Pie"  onClick={(ev) => {ev.preventDefault(); this.addPlotTrace('pie');}}/>        
            <MenuItem icon="scatter-plot" text="Scatter"  onClick={(ev) => {ev.preventDefault(); this.addPlotTrace('scatter');}}/>        
        </Menu>
        );
        
        
        //If we are in edit mode,
        if( typeof this.props.options.reportId !== 'undefined' ){
            
            //If the report info is ready
            if(this.props.reportInfo !== null ){
                
                //If the report has options set or they are not empty
                //@TODO: there should always be a type options for the report type
                //this.reportTypeChange prevents this code section from being run every time
                //the report type is changed.
                if(Object.keys(this.props.reportInfo.options).length !== 0 && this.reportTypeChange === false){
                    let plotOptions =  JSON.parse(this.props.reportInfo.options)
    
                    if(plotOptions.type === 'Graph' && this.state.reportType !== 'Graph'){
                        this.plotData = plotOptions.data
                        this.plotLayout = plotOptions.layout
                        this.updateReportType('Graph')
                        
                        //@TODO: Findout which aggrid event is fired when the 
                        //data has been loaded in the grid. If it exists, use it.
                        //In the meantime, we use a timeout to load athe preview 
                        //graph
                        setTimeout(() => { 
                            this.handleModelUpdated() 
                            this.updatePlotData(this.plotData)
                        }, 3000)
                    }
                }
                
                //Show review
                if(this.state.loadPreview === false){
                    this.loadPreview()
                }
            }
        }
        
        return (
        <div className='cotainer p-0 m-0 mr-2'>
            <h3><FontAwesomeIcon icon="table"/> {tabTitle}</h3>
            {this.props.creating === true || this.fetchingReportInfo === true ? <ProgressBar intent={Intent.PRIMARY} className="mb-2"></ProgressBar> : ""}
            <div className="row">
                <div className="col-sm">
                    <div className="mb-2">
                    <AceEditor
                        ref="aceEditor"
                        mode="sql"
                        theme="github"
                        onChange={this.onAceChange}
                        name="create_or_edit_report"
                        editorProps={{$blockScrolling: true}}
                        maxLines={15}
                        minLines={15}
                        value={this.aceEditorValue}
                      />        
                      </div>
                </div>
                  
                <div className="col-sm">

                    <HTMLSelect options={this.reportTypes} onChange={this.selectReportType.bind(this)} value={this.state.reportType} className="mb-2 mr-2"></HTMLSelect>
                    
                    <Select 
                        key={this.nameRedraw}
                        noResults={<MenuItem disabled={true} text="No categories." />}
                        items={this.props.categories}
                        itemListRenderer={this.categoryItemListRenderer}
                        itemRenderer={this.categoryItemRenderer}
                        itemPredicate={this.categoryItemPredicate}
                        onItemSelect={this.handleCategoryValueChange}
                        activeItem={activeItem}
                        initialContent={<MenuItem disabled={true} text="Category" />}
                            >
                        <Button
                            icon="folder-close"
                            rightIcon="caret-down"
                            text={category ? `${category.name}` : "(No selection)"}
                            disabled={false}
                            className="mb-2"
                        />        
                    </Select>

                    <FormGroup
                        helperText=""
                        label="Report Name"
                        labelFor="text-input"
                        labelInfo=""
                    >
                    <InputGroup id="text-input" placeholder="Report name" className='mb-1' onChange={this.handleNameChange} defaultValue={this.reportName} key={this.nameRedraw}/>
                    </FormGroup>
                    <FormGroup
                        helperText=""
                        label="Notes"
                        labelFor=""
                        labelInfo=""
                        >
                        <TextArea
                            large={true}
                            intent={Intent.PRIMARY}
                            onChange={this.handleNotesChange}
                            value={this.state.notesValue}
                            className='mb-1'
                            defaultValue={defaultNotes}
                            fill={true}
                            key={this.nameRedraw}
                        />
                        
                        <Button icon="refresh" text="Preview"  onClick={this.loadPreview} />  <Button icon="plus" intent='success' text="Save" onClick={this.saveReport} disabled={this.props.creating === true ? true : false}/>
                    </FormGroup>
                </div>
            </div>
            <div className="row">
                <div className="col-sm mt-2">
                        {previewTable}
                </div>
            </div>
            
            {this.state.reportType === 'Graph'?
            <div className="row">
                <div className="col-sm mt-2" style={{width: "100%"}}>
                    <Plot
                        revision={this.plotReloadCount}
                        data={this.plotData}
                        layout={this.plotLayout}
                        config={{displaylogo:false}}
                        useResizeHandler={true}
                    />
                </div>
                <div className="col-sm mt-2">
                    <Popover content={plotTypesMenu} position={Position.RIGHT_BOTTOM}>
                        <Button icon="plus" text="Add trace"  rightIcon="caret-down"/>
                    </Popover>
                    <GraphOptionsContainer fields={this.props.fields} plotOptions={this.plotData} layoutOptions={this.plotLayout} key={"reload-" + this.state.plotReloadCount} updateGraphOptions={this.updateGraphOptions.bind(this)} updateLayoutOptions={this.updateLayoutOptions.bind(this)}/>
                </div>
            </div>
            : "" }

        </div>
        );
    }
}

function mapStateToProps(state, ownProps){
    let reportInfo = null //holds details of report to be editted
    
    if(typeof ownProps.options.reportId !== 'undefined'){
        const reportId = ownProps.options.reportId
        if(typeof state.reports.reportsInfo[reportId] !== 'undefined'){ 
            reportInfo = state.reports.reportsInfo[reportId] 
            if(reportInfo.options === null) reportInfo.options  = {}
        }
    }
    
    return {
        previewError: state.reports.create.error,
        token: state.session.userDetails.token,
        fields: state.reports.create.fields,
        categories: state.reports.reports.map(r => ({id: r.cat_id, name: r.cat_name}) ),
        creating: state.reports.create.creating,
        reportInfo: reportInfo
    };
}

export default connect(mapStateToProps)(CreateReport);

import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReports, setReportFilter, deleteReport, getReportInfo,
         clearReportTreeError } from './reports-actions';
import { addTab, closeTab } from '../layout/uilayout-actions';
import { 
    Classes, 
    Icon, 
    Tree, 
    FormGroup, 
    InputGroup, 
    ButtonGroup,
    ContextMenu, 
    Menu, 
    MenuItem,
    ProgressBar, 
    Dialog, 
    TextArea, 
    Intent, 
    Spinner, 
    Button,
    Divider
} from "@blueprintjs/core";
import './reports-panel.css';
import { saveCategory, clearReportCreateState, removeCategory, getCategory,
		clearEditCategoryState, clearCreateCompReportState, 
		clearNewCategoryState } 
	from "./reports-actions"


class ReportsTree extends React.Component{
    static icon = "table";
    static label = "Reports";
    
    constructor(props){
        super(props)
        
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        this.dismissError = this.dismissError.bind(this);
        this.showReportDataTab = this.showReportDataTab.bind(this);
        this.updateNodes = this.updateNodes.bind(this);
        this.onNodeDoubleClick = this.onNodeDoubleClick.bind(this);
        this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
		this.refreshReportTree = this.refreshReportTree.bind(this);
		this.openCreateCategoryDialog = this.openCreateCategoryDialog.bind(this)
        this.handleSave = this.handleSave.bind(this)
		this.createCompositeReport = this.createCompositeReport.bind(this)
		
        this.state = {
            text: this.props.filter.text,
            categories: this.props.filter.categories,
            reports: this.props.filter.reports,
            nodesChanges: 0,
            expandedNodes:[],

            isContextMenuOpen: false,
          
          /*Category edit/rename dialog*/
            autoFocus: true,
            canEscapeKeyClose: true,
            canOutsideClickClose: true,
            enforceFocus: true,
            isOpen: false,
            usePortal: true,
            
            catName: '',
			notesValue: ""
        };
        
		if( this.props.editCat !== null ){
			this.state.notesValue = typeof this.props.editCat.id !== 'undefined' ? this.props.editCat.notes : "";
		}
		
        this.filterReports = this.state.reports;
        this.filterText = this.state.text;
        this.filterCategories = this.state.categories;
        
        this.nodes = [];

        
        //This is incremented to force input and textare for category renaming to
        //re-render
        this.nameRedraw = 0;
        
        //This shows the saving spinner when true
        this.isSaving  = false;
        
		//Add/Edit category 
        this.catName = "Category name";
        this.catNotes = "Category notes";
		this.catDialogTitle = "Add report catgory"

    }

    handleNotesChange = (event) => { 
		this.catNotes = event.target.value; 
		this.setState({notesValue: event.target.value})
	}
    handleCatNameChange = (event) => this.catName = event.target.value
    
    /**
     * Show reports context menu
     * 
     * @param node
     * @param nodePath
     * @param e
     */
    showContextMenu(node, nodePath, e){
        e.preventDefault();

        // Add context menu based on entity type
        if(typeof node.reportId !== 'undefined'){
            ContextMenu.show(
                <Menu>
                    <MenuItem icon="th" text="View report" onClick={(ev) => {ev.preventDefault(); this.showReportDataTab(node.label, node.reportId);}}/>
					{node.inBuilt === true ? "" : <MenuItem icon="graph-remove" text="Delete report" onClick={(ev) => {ev.preventDefault(); this.removeReport(node.reportId);}}/> }	
					{ node.inBuilt === false && node.type === 'composite' ? <MenuItem icon="edit" text="Edit report" onClick={(ev) => {ev.preventDefault(); this.createCompositeReport(node.reportId)}} /> : "" }
					{ node.inBuilt === false && node.type !== 'composite' ? <MenuItem icon="edit" text="Edit report" onClick={(ev) => {ev.preventDefault(); this.createCompositeReport(node.reportId)}} /> : "" }
					
                </Menu>,
                { left: e.clientX, top: e.clientY },
                () => this.setState({ isContextMenuOpen: false }),
            );
        }else{ //category folder
            
            ContextMenu.show(
                <Menu>
                    <MenuItem icon="edit" text="Edit category" onClick={(ev) => {ev.preventDefault(); this.openEditCategoryDialog(node.catId)} } />                    
                    {node.inBuilt === true ? "" : <MenuItem icon="delete" text="Delete category" onClick={(ev) => {ev.preventDefault(); this.deleteCategory(node.catId)} } /> }	
                </Menu>,
                { left: e.clientX, top: e.clientY },
                () => this.setState({ isContextMenuOpen: false }),
            );
            
        }
        
        this.setState({ isContextMenuOpen: true });

    }

    /**
     * Open report edit tab. This uses the same component as for creating new
     * reports. The reportId differentiates between create and edit.
     * 
     * @param {type} reportId
     * @returns {undefined}
     */
    showEditTab(reportId){
        let tabId  = 'create_report';
        
        //Close any open create tab
        this.props.dispatch(closeTab(tabId));
        this.props.dispatch(clearReportCreateState());
        
        //Fetch report details 
        this.props.dispatch(getReportInfo(reportId))
        
        //add delay before showing edit mode
        //Without this, there is 
        setTimeout(()=> {
            this.props.dispatch(addTab(tabId, 'CreateReport', {
                title: 'Edit Report',
                reportId: reportId
            }));
        },100)

                
    }
	
    /**
     * Delete report
     * 
     * @param Integer reportId report primary key
     */
    removeReport(reportId){
        this.props.dispatch(deleteReport(reportId))
        
        ContextMenu.hide();
    }
    
	
    /**
     * Handle change event on search input field
     * 
     * @param {type} event
     */
    handleChangeEvent(event){
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
        
        switch(name){
            case 'text':this.filterText = value;break;
            case 'reports':this.filterReports = value;break;
            case 'categories':this.filterCategories = value;break;
			default: this.filterText = value;break;
        }
        
        this.updateFilter();
    }


	openEditCategoryDialog = (categoryId) => { 
		this.setState({ isOpen: true });
		this.props.dispatch(getCategory(categoryId));
		
		ContextMenu.hide();
	} 

	
    /**
     * Delete report category 
     * 
     */
    deleteCategory(catId){
        this.props.dispatch(removeCategory(catId));
    }    
	
    /**
     * Check whether list of reports provided contains atleast one matching the 
     * search string 
     * 
     * @param Array rules Array of rules
     * @param String search Search String
     * @returns {Boolean}
     */
    catContainsMatchingReport(reports, search){
        var regex = new RegExp(search, 'i');
        for(var key in reports){
            if ( regex.test(reports[key].name) ) return true;
        }
        return false;
    }
    
    /**
     * Update report search 
     * 
     * @returns {undefined}
     */
    updateFilter(){
        this.props.dispatch(setReportFilter(this.state.text, this.filterCategories, this.filterReports));
    }
    
    componentDidMount(){
        this.props.dispatch(getReports());
        this.updateNodes();
    }
    
    dismissError(){
        this.props.dispatch(clearReportTreeError());
    }
    
   
    showReportDataTab(reportName, reportId){ 
        let tabId = 'report_' + reportId + "_tab";
        
        this.props.dispatch(addTab(tabId, 'ReportContainer', {
            title: reportName,
            reportId: reportId
        }));
    }
    
    /**
     * Update tree nodes
     * 
     * @returns
     */
    updateNodes(){
        this.nodes = [];
        
        const filterText = this.state.text;
        let filterOnReports = this.state.reports
        const filterOnCategories = this.state.categories;
        //const noFilter = filterOnReports && filterOnCategories && (filterText === '');
		
		//If nothing is selected, filter on reports
		if( !filterOnReports && !filterOnCategories && filterText !== "") filterOnReports = true
        
        for(let key in this.props.reports){
            let cat = this.props.reports[key];
            
            //Filter categories
            var regex = new RegExp(filterText, 'i');
            if( (filterText !== "" && filterOnCategories && !regex.test(cat.cat_name)) || 
                (!this.catContainsMatchingReport(cat.reports, filterText) && filterOnReports )
              ){ 
                continue;
            }
        
            const isExpanded = this.state.expandedNodes.indexOf(cat.cat_id) !== -1
            const icon = isExpanded === true ? "folder-open": "folder-close"
            let reportCategory = {
                id: cat.cat_id,
                hasCaret: true,
                icon: icon,
                label: cat.cat_name,
                key: cat.cat_id,
                isExpanded : isExpanded,
                catId: cat.cat_id,
				inBuilt: cat.in_built,
                childNodes: []        
            };
            
            //Get reports under category 
            for (let k in cat.reports){
                let report = cat.reports[k];
                
                //Filter reports
                if( (filterText !== "" && filterOnReports && !regex.test(report.name)) ){
                    continue;
                }
                
                reportCategory['childNodes'].push({
                    id: cat.cat_id + "-" + report.id,
                    label: report.name,
                    icon: "document",
                    reportId: report.id,
                    catId: cat.cat_id,
					type: report.type.toLowerCase(),
					inBuilt: report.in_built
                });
            }
            this.nodes.push(reportCategory);

        }
    }

    /**
     * Show report table when report name is double clicked
     * 
     * @param {type} nodeData
     * @returns {undefined}
     */
    onNodeDoubleClick = (nodeData) => {

        if(typeof nodeData.reportId !== 'undefined'){
            this.showReportDataTab(nodeData.label, nodeData.reportId);
        }
    }
    
    handleNodeCollapse = (nodeData) => {
        const expandedNodes = this.state.expandedNodes.filter((v,k) => v !== nodeData.catId)
        this.setState({expandedNodes: expandedNodes});
    };

    handleNodeExpand = (nodeData) => {
        
        let expandedNodes = this.state.expandedNodes;
        if(this.state.expandedNodes.indexOf(nodeData.catId) === -1 ){
            expandedNodes.push(nodeData.catId)
        }else{
            return true;
        }
        
        this.setState({expandedNodes: expandedNodes});
    };

    createReport = () => {
        let tabId  = 'create_report';
        
        //Close any open create tab
        //This is to fix a bug caused by create and edit using the same component
        this.props.dispatch(closeTab(tabId));
        this.props.dispatch(clearReportCreateState());
        
        //The delay is toe ensure the previous close has time to clean up
        setTimeout(()=>{
            this.props.dispatch(addTab(tabId, 'CreateReport', {
                title: 'Create Report'
            }));
        },10)

    }
	
	/*
	* Refresh the report tree
	*/
	refreshReportTree = () => {
		this.props.dispatch(getReports());
	}
	
    
    openCreateCategoryDialog = () => { 
		this.props.dispatch(clearEditCategoryState());
		this.props.dispatch(clearNewCategoryState());
		this.catName = "";
		this.catNotes = "";
		this.catDialogTitle = "Add report category";
		this.setState({ isOpen: true, notesValue: "" }) 
	};
	
    closeCreateCategoryDialog = () => this.setState({ isOpen: false });
    
    handleSave = () => {
		const catId = this.props.editCat !== null ? this.props.editCat.id : null;
        this.props.dispatch(saveCategory(this.catName, this.catNotes, catId ));
        this.isSaving  = true;
    }
	
	createCompositeReport = (reportId) => {
		let tabId  = 'create_composite_report';
		
        //Close any open create tab
        //This is to fix a bug caused by create and edit using the same component
        this.props.dispatch(closeTab(tabId));
        this.props.dispatch(clearCreateCompReportState());
        
        //The delay is to ensure the previous close has time to clean up
        setTimeout(()=>{
			this.props.dispatch(addTab(tabId, 'CreateCompositeReport', {
				title: typeof reportId === 'number' ? "Edit Composite Report" : "Create Composite Report",
				options: {
					reportId: typeof reportId === 'number' ? reportId : null 
				}
			}));
			
        },10)
	
		
	}
    render(){        
        
        this.updateNodes();
                         
        //Show progress bar when report details are being fetched 
        let catDetailsLoadingProgressBar = null;
        if( this.props.editCat !== null){
            catDetailsLoadingProgressBar = this.props.editCat.requesting === true ? <ProgressBar className="mb-2"/> : "";
        }
		

		if(this.props.editCat !== null){
			this.catName = this.props.editCat.name;
			this.catNotes = this.props.editCat.notes;
			this.catDialogTitle = "Edit report catgory"
		}
		
        return (
            
        <div>
        <div className="legend w-100 mb-2">
            <ButtonGroup minimal={true} vertical={false}>
                <Button icon="refresh" onClick={this.refreshReportTree} />
                <Divider/>
                <Button onClick={this.openCreateCategoryDialog} icon="folder-new" />
                <Divider/>
                <Button onClick={this.createReport} icon="plus"/>
                <Divider/>
                <Button onClick={this.createCompositeReport} icon="new-object"/>
            </ButtonGroup>
        </div>
                <div>
                <FormGroup
                    label=""
                    labelFor="search_reports"
                >
                    <InputGroup 
                        id="search_network" 
                        placeholder="Search reports..." 
                        leftIcon="search" 
                        name="text"
                        type="text"
                        value={this.state.text} 
                        onChange={this.handleChangeEvent}
                    />
                </FormGroup>
                
                <div className="mb-2">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={this.state.categories} name="categories" onChange={this.handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox1">Categories</label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox2" checked={this.state.reports} name="reports" onChange={this.handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox2">Reports</label>
                    </div>
                </div>
        
                {this.props.requestError === null ? '': 
                    <div className="alert alert-danger mt-1 mb-1 p-2" role="alert">
                        {this.props.requestError}
                        <button type="button" className="close"  aria-label="Close" onClick={this.dismissError}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>     
                }
                
                {this.props.requestingReports === true ? <ProgressBar /> : ""}
                
            <Tree 
                contents={this.nodes}
                onNodeDoubleClick={this.onNodeDoubleClick}
                onNodeCollapse={this.handleNodeCollapse}
                onNodeExpand={this.handleNodeExpand}
                onNodeContextMenu={this.showContextMenu}
            />
            </div>
            
			<Dialog
			icon="folder-new"
			title={this.catDialogTitle}
			{...this.state}
			onClose={this.closeCreateCategoryDialog}
			>
			
				<div className={Classes.DIALOG_BODY}>
			
					{catDetailsLoadingProgressBar}
					
					<FormGroup
						helperText=""
						label="Category Name"
						labelFor="text-input"
						labelInfo=""
					>
					<InputGroup id="text-input" placeholder="Report category name" className='mb-1' onChange={this.handleCatNameChange} defaultValue={this.catName}/>
					</FormGroup>       
					
					<FormGroup
						helperText=""
						label="Notes"
						labelFor=""
						labelInfo=""
					>
						<TextArea
							placeholder="Report category notes"
							large={true}
							intent={Intent.PRIMARY}
							onChange={this.handleNotesChange}
							className='mb-1'
							fill={true}
							value={this.state.notesValue}
						/>
					</FormGroup>
					
					<Button icon="plus" intent='success' text="Save" onClick={this.handleSave} disabled={this.props.requesting} />  {this.props.requesting === true ? <Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL}/> : ""}
				</div>
			</Dialog>
			
        </div>
        );
    }
    
}
    
function mapStateToProps(state){

    return {
        reports: state.reports.reports, //categories
        filter: state.reports.filter,
        requestingReports: state.reports.requestingReports,
        requestError: state.reports.requestError,
		requesting: state.reports.newCat.requesting, //report categories
		editCat: state.reports.editCat
    };
    
    
}

export default connect(mapStateToProps)(ReportsTree);